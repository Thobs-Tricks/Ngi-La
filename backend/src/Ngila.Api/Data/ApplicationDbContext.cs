using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Ngila.Api.Models.Entities;

namespace Ngila.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<VendorProfile> VendorProfiles => Set<VendorProfile>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<FeedPost> FeedPosts => Set<FeedPost>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<ActivityLogEntry> ActivityLogEntries => Set<ActivityLogEntry>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(u => u.LastName).HasMaxLength(100).IsRequired();
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.TokenHash).IsUnique();
            entity.Property(rt => rt.TokenHash).HasMaxLength(256).IsRequired();
            entity.Property(rt => rt.CreatedByIp).HasMaxLength(64);
            entity.Property(rt => rt.RevokedByIp).HasMaxLength(64);

            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<VendorProfile>(entity =>
        {
            entity.Property(v => v.BusinessName).HasMaxLength(200).IsRequired();
            entity.Property(v => v.Description).HasMaxLength(1000);
            entity.Property(v => v.LocationDescription).HasMaxLength(300);
            entity.Property(v => v.ImageUrl).HasMaxLength(2048);
            entity.Property(v => v.ContactPhone).HasMaxLength(30);
            entity.Property(v => v.Latitude).HasPrecision(9, 6);
            entity.Property(v => v.Longitude).HasPrecision(10, 6);
            entity.Property(v => v.Rating).HasPrecision(3, 2);

            // UserId is nullable: null = "community-added", not yet claimed by an owning
            // account. Restrict (not SetNull/Cascade) - SQL Server rejects a second
            // cascade-adjacent path back to AspNetUsers alongside AddedByUserId's SetNull.
            // Deleting a vendor's own account is blocked while they still own a listing.
            entity.HasOne(v => v.User)
                .WithOne(u => u.VendorProfile)
                .HasForeignKey<VendorProfile>(v => v.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(v => v.AddedByUser)
                .WithMany()
                .HasForeignKey(v => v.AddedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(v => v.Category)
                .WithMany(c => c.VendorProfiles)
                .HasForeignKey(v => v.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(v => v.UserId).IsUnique();
            entity.HasIndex(v => v.CategoryId);
            entity.HasIndex(v => v.AddedByUserId);
        });

        builder.Entity<CustomerProfile>(entity =>
        {
            entity.HasOne(c => c.User)
                .WithOne(u => u.CustomerProfile)
                .HasForeignKey<CustomerProfile>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => c.UserId).IsUnique();
        });

        builder.Entity<Category>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(100).IsRequired();
            entity.HasIndex(c => c.Name).IsUnique();
        });

        builder.Entity<FeedPost>(entity =>
        {
            entity.Property(f => f.AuthorDisplayRole).HasMaxLength(100).IsRequired();
            entity.Property(f => f.Content).HasMaxLength(500).IsRequired();

            entity.HasOne(f => f.AuthorUser)
                .WithMany()
                .HasForeignKey(f => f.AuthorUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Restrict (not SetNull) - SQL Server rejects a second cascade-adjacent path back to
            // AspNetUsers (this one via VendorProfiles.UserId) alongside AuthorUserId's cascade.
            entity.HasOne(f => f.Vendor)
                .WithMany()
                .HasForeignKey(f => f.VendorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(f => f.CreatedAt);
        });

        builder.Entity<Review>(entity =>
        {
            entity.Property(r => r.Rating).IsRequired();
            entity.Property(r => r.Comment).HasMaxLength(1000);

            entity.HasOne(r => r.Vendor)
                .WithMany()
                .HasForeignKey(r => r.VendorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Restrict, not Cascade - avoids the same multi-path cascade conflict seen on
            // FeedPosts (Vendor -> User is a second path back to AspNetUsers alongside this one).
            entity.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // One review per (vendor, reviewer) - resubmitting updates the existing row.
            entity.HasIndex(r => new { r.VendorId, r.UserId }).IsUnique();
        });

        builder.Entity<Notification>(entity =>
        {
            entity.Property(n => n.Title).HasMaxLength(200).IsRequired();
            entity.Property(n => n.Body).HasMaxLength(500).IsRequired();

            entity.HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(n => n.Vendor)
                .WithMany()
                .HasForeignKey(n => n.VendorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt });
        });

        builder.Entity<Report>(entity =>
        {
            entity.Property(r => r.Title).HasMaxLength(200).IsRequired();
            entity.Property(r => r.Detail).HasMaxLength(1000).IsRequired();

            entity.HasOne(r => r.ReporterUser)
                .WithMany()
                .HasForeignKey(r => r.ReporterUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // All Restrict: Report already cascades from ReporterUserId, and SQL Server rejects
            // a second cascade-capable path to the same ancestor - directly (ResolvedByUserId ->
            // AspNetUsers) or transitively (TargetVendorId -> VendorProfiles, and
            // TargetReviewId -> Reviews.VendorId -> VendorProfiles, both of which can reach
            // AspNetUsers).
            entity.HasOne(r => r.ResolvedByUser)
                .WithMany()
                .HasForeignKey(r => r.ResolvedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.TargetVendor)
                .WithMany()
                .HasForeignKey(r => r.TargetVendorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.TargetReview)
                .WithMany()
                .HasForeignKey(r => r.TargetReviewId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(r => r.IsResolved);
            entity.HasIndex(r => r.CreatedAt);
        });

        builder.Entity<ActivityLogEntry>(entity =>
        {
            entity.Property(a => a.Description).HasMaxLength(300).IsRequired();
            entity.Property(a => a.Tone).HasMaxLength(50).IsRequired();

            entity.HasOne(a => a.ActorUser)
                .WithMany()
                .HasForeignKey(a => a.ActorUserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(a => a.CreatedAt);
        });
    }
}
