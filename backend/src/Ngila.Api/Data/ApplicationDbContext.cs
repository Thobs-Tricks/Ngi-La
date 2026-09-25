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
            entity.Property(v => v.Latitude).HasPrecision(9, 6);
            entity.Property(v => v.Longitude).HasPrecision(10, 6);
            entity.Property(v => v.Rating).HasPrecision(3, 2);

            entity.HasOne(v => v.User)
                .WithOne(u => u.VendorProfile)
                .HasForeignKey<VendorProfile>(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(v => v.Category)
                .WithMany(c => c.VendorProfiles)
                .HasForeignKey(v => v.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(v => v.UserId).IsUnique();
            entity.HasIndex(v => v.CategoryId);
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
    }
}
