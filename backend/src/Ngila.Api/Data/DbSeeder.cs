using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Ngila.Api.Common;
using Ngila.Api.Configuration;
using Ngila.Api.Models.Entities;
using Ngila.Api.Models.Enums;

namespace Ngila.Api.Data;

public static class DbSeeder
{
    // Shared password for every account this seeder creates. Clearly a demo-only credential,
    // never used for the AdminBootstrap account (that one is configured separately and kept
    // out of source control).
    private const string DemoPassword = "Demo@Pass2026";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var context = services.GetRequiredService<ApplicationDbContext>();
        var adminSettings = services.GetRequiredService<IOptions<AdminBootstrapSettings>>().Value;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        await SeedRolesAsync(roleManager);
        await SeedAdminAsync(userManager, adminSettings, logger);

        var categories = await SeedCategoriesAsync(context, logger);
        await SeedDemoVendorsAndCustomersAsync(context, userManager, categories, logger);
        await SeedFeedPostsAsync(context, logger);
        await SeedCommunityAddedVendorAsync(context, categories, logger);
        await SeedNotificationsAsync(context, logger);
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }

    private static async Task SeedAdminAsync(
        UserManager<ApplicationUser> userManager, AdminBootstrapSettings adminSettings, ILogger logger)
    {
        var anyAdmin = (await userManager.GetUsersInRoleAsync(Roles.Admin)).Any();
        if (anyAdmin)
            return;

        if (string.IsNullOrWhiteSpace(adminSettings.Email) || string.IsNullOrWhiteSpace(adminSettings.Password))
        {
            logger.LogWarning(
                "No admin account exists and AdminBootstrap:Email/Password are not configured. " +
                "Set them via user-secrets (local) or Key Vault / App Service configuration (Azure) to create the first admin.");
            return;
        }

        var admin = new ApplicationUser
        {
            UserName = adminSettings.Email,
            Email = adminSettings.Email,
            FirstName = adminSettings.FirstName ?? "Ngila",
            LastName = adminSettings.LastName ?? "Admin",
            EmailConfirmed = true,
            // OperationsAdmin so the very first admin can actually create/manage other admins
            // and categories - the two things only that title is allowed to do.
            AdminTitle = AdminTitle.OperationsAdmin,
        };

        var result = await userManager.CreateAsync(admin, adminSettings.Password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, Roles.Admin);
            logger.LogInformation("Bootstrap admin account created for {Email}.", adminSettings.Email);
        }
        else
        {
            logger.LogError(
                "Failed to create bootstrap admin account: {Errors}",
                string.Join(" ", result.Errors.Select(e => e.Description)));
        }
    }

    private static async Task<Dictionary<string, Category>> SeedCategoriesAsync(ApplicationDbContext context, ILogger logger)
    {
        var names = new[] { "Food", "Fresh Produce", "Clothing", "Barber", "Repairs", "Car Wash", "Accessories" };

        var existing = await context.Categories.ToDictionaryAsync(c => c.Name);
        var missing = names.Where(n => !existing.ContainsKey(n)).ToList();

        if (missing.Count > 0)
        {
            var newCategories = missing.Select(n => new Category { Name = n }).ToList();
            context.Categories.AddRange(newCategories);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} categories.", newCategories.Count);

            foreach (var category in newCategories)
                existing[category.Name] = category;
        }

        return existing;
    }

    private static async Task SeedDemoVendorsAndCustomersAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        Dictionary<string, Category> categories,
        ILogger logger)
    {
        var vendorSeeds = new[]
        {
            new DemoVendorSeed(
                "Mary", "Ndlovu", "mary.ndlovu@ngila.demo",
                "Mama Mary's Kitchen", "Authentic homemade meals and traditional favourites prepared fresh every day.",
                "Food", "Braamfontein, Johannesburg", -26.1925m, 28.0308m,
                new TimeSpan(7, 0, 0), new TimeSpan(18, 0, 0), VendorStatus.Verified, 4.8m, 126,
                "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80"),
            new DemoVendorSeed(
                "Sipho", "Ndlovu", "sipho.ndlovu@ngila.demo",
                "Sipho Fresh Produce", "Fresh fruit and vegetables sourced from local farmers and sold at affordable prices.",
                "Fresh Produce", "Braamfontein, Johannesburg", -26.1940m, 28.0320m,
                new TimeSpan(6, 30, 0), new TimeSpan(17, 0, 0), VendorStatus.PendingVerification, 4.6m, 74,
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"),
            new DemoVendorSeed(
                "Kagiso", "Sithole", "kagiso.sithole@ngila.demo",
                "King's Cut Barber", "Professional cuts, fades and grooming services from experienced local barbers.",
                "Barber", "Braamfontein, Johannesburg", -26.1910m, 28.0295m,
                new TimeSpan(8, 0, 0), new TimeSpan(19, 0, 0), VendorStatus.Verified, 4.9m, 208,
                "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"),
            new DemoVendorSeed(
                "Vusi", "Mahlangu", "vusi.mahlangu@ngila.demo",
                "Vusi Airtime & Accessories", "Airtime, data, phone accessories and everyday mobile essentials.",
                "Accessories", "Braamfontein, Johannesburg", -26.1950m, 28.0350m,
                new TimeSpan(8, 0, 0), new TimeSpan(18, 0, 0), VendorStatus.PendingVerification, 4.5m, 52,
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"),
            new DemoVendorSeed(
                "Sello", "Radebe", "sello.radebe@ngila.demo",
                "Sello Shoe Repairs", "Affordable shoe repairs, restoration and maintenance for all types of footwear.",
                "Repairs", "Braamfontein, Johannesburg", -26.1890m, 28.0270m,
                new TimeSpan(8, 30, 0), new TimeSpan(17, 30, 0), VendorStatus.Verified, 4.7m, 89,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"),
            new DemoVendorSeed(
                "Lindiwe", "Zulu", "lindiwe.zulu@ngila.demo",
                "Sparkle Mobile Car Wash", "Convenient mobile car wash services brought directly to your location.",
                "Car Wash", "Braamfontein, Johannesburg", -26.1970m, 28.0400m,
                new TimeSpan(8, 0, 0), new TimeSpan(17, 0, 0), VendorStatus.PendingVerification, 4.4m, 41,
                "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80"),
            new DemoVendorSeed(
                "Joyce", "Mokoena", "joyce.mokoena@ngila.demo",
                "Auntie Joyce Vetkoek", "Freshly fried vetkoek and shisanyama favourites, a Braamfontein institution.",
                "Food", "Braamfontein, Johannesburg", -26.1920m, 28.0300m,
                new TimeSpan(7, 0, 0), new TimeSpan(15, 0, 0), VendorStatus.Verified, 4.5m, 30,
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"),
        };

        foreach (var seed in vendorSeeds)
        {
            if (await userManager.FindByEmailAsync(seed.Email) is not null)
                continue;

            var user = new ApplicationUser
            {
                UserName = seed.Email,
                Email = seed.Email,
                FirstName = seed.FirstName,
                LastName = seed.LastName,
                EmailConfirmed = true,
            };

            var result = await userManager.CreateAsync(user, DemoPassword);
            if (!result.Succeeded)
            {
                logger.LogError(
                    "Failed to seed demo vendor {Email}: {Errors}",
                    seed.Email, string.Join(" ", result.Errors.Select(e => e.Description)));
                continue;
            }

            await userManager.AddToRoleAsync(user, Roles.Vendor);

            context.VendorProfiles.Add(new VendorProfile
            {
                UserId = user.Id,
                BusinessName = seed.BusinessName,
                Description = seed.Description,
                CategoryId = categories[seed.CategoryName].Id,
                LocationDescription = seed.Location,
                Latitude = seed.Latitude,
                Longitude = seed.Longitude,
                OpeningTime = seed.OpeningTime,
                ClosingTime = seed.ClosingTime,
                Status = seed.Status,
                Rating = seed.Rating,
                ReviewsCount = seed.ReviewsCount,
                ImageUrl = seed.ImageUrl,
            });
        }

        var customerSeeds = new[]
        {
            ("Thabo", "Molefe", "thabo.molefe@ngila.demo"),
            ("Nomusa", "Khumalo", "nomusa.khumalo@ngila.demo"),
            ("Sipho", "Nkosi", "sipho.nkosi@ngila.demo"),
            ("Naledi", "Dube", "naledi.dube@ngila.demo"),
        };

        foreach (var (firstName, lastName, email) in customerSeeds)
        {
            if (await userManager.FindByEmailAsync(email) is not null)
                continue;

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                EmailConfirmed = true,
            };

            var result = await userManager.CreateAsync(user, DemoPassword);
            if (!result.Succeeded)
            {
                logger.LogError(
                    "Failed to seed demo customer {Email}: {Errors}",
                    email, string.Join(" ", result.Errors.Select(e => e.Description)));
                continue;
            }

            await userManager.AddToRoleAsync(user, Roles.Customer);
            context.CustomerProfiles.Add(new CustomerProfile { UserId = user.Id });
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {VendorCount} demo vendors and {CustomerCount} demo customers.",
            vendorSeeds.Length, customerSeeds.Length);
    }

    private static async Task SeedFeedPostsAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.FeedPosts.AnyAsync())
            return;

        var thabo = await context.Users.FirstOrDefaultAsync(u => u.Email == "thabo.molefe@ngila.demo");
        var nomusa = await context.Users.FirstOrDefaultAsync(u => u.Email == "nomusa.khumalo@ngila.demo");
        var sipho = await context.Users.FirstOrDefaultAsync(u => u.Email == "sipho.nkosi@ngila.demo");

        var auntieJoyce = await context.VendorProfiles.FirstOrDefaultAsync(v => v.BusinessName == "Auntie Joyce Vetkoek");
        var kingsCut = await context.VendorProfiles.FirstOrDefaultAsync(v => v.BusinessName == "King's Cut Barber");
        var siphoProduce = await context.VendorProfiles.FirstOrDefaultAsync(v => v.BusinessName == "Sipho Fresh Produce");

        if (thabo is null || nomusa is null || sipho is null || auntieJoyce is null || kingsCut is null || siphoProduce is null)
        {
            logger.LogWarning("Skipped feed post seeding - one or more referenced demo accounts/vendors were not found.");
            return;
        }

        var now = DateTime.UtcNow;

        context.FeedPosts.AddRange(
            new FeedPost
            {
                AuthorUserId = thabo.Id,
                AuthorDisplayRole = "Community Scout",
                Content = "Just discovered this amazing local spot!",
                VendorId = auntieJoyce.Id,
                LikesCount = 24,
                CommentsCount = 5,
                CreatedAt = now.AddMinutes(-15),
            },
            new FeedPost
            {
                AuthorUserId = nomusa.Id,
                AuthorDisplayRole = "Local Explorer",
                Content = "King's Cut never disappoints 🔥",
                VendorId = kingsCut.Id,
                LikesCount = 42,
                CommentsCount = 8,
                CreatedAt = now.AddHours(-2),
            },
            new FeedPost
            {
                AuthorUserId = sipho.Id,
                AuthorDisplayRole = "Vendor Rep",
                Content = "Fresh stock just arrived! 🍎🥬",
                VendorId = siphoProduce.Id,
                LikesCount = 67,
                CommentsCount = 12,
                CreatedAt = now.AddHours(-5),
            });

        await context.SaveChangesAsync();
        logger.LogInformation("Seeded 3 demo feed posts.");
    }

    // Demonstrates the flagship "community adds a vendor Ngila doesn't know about yet" flow -
    // an unclaimed listing (UserId null) sitting alongside the claimed demo vendors above.
    private static async Task SeedCommunityAddedVendorAsync(
        ApplicationDbContext context, Dictionary<string, Category> categories, ILogger logger)
    {
        const string businessName = "Ntombi's Braai Stand";
        if (await context.VendorProfiles.AnyAsync(v => v.BusinessName == businessName))
            return;

        var addedBy = await context.Users.FirstOrDefaultAsync(u => u.Email == "naledi.dube@ngila.demo");
        if (addedBy is null)
        {
            logger.LogWarning("Skipped community-added vendor seeding - seed customer not found.");
            return;
        }

        context.VendorProfiles.Add(new VendorProfile
        {
            UserId = null,
            AddedByUserId = addedBy.Id,
            BusinessName = businessName,
            Description = "Weekend braai spot near the taxi rank - amazing chops, cash only.",
            CategoryId = categories["Food"].Id,
            LocationDescription = "Next to the Bree Street taxi rank, Braamfontein",
            Latitude = -26.1955m,
            Longitude = 28.0330m,
            ContactPhone = null,
            Status = VendorStatus.PendingVerification,
        });

        await context.SaveChangesAsync();
        logger.LogInformation("Seeded 1 unclaimed community-added vendor.");
    }

    private static async Task SeedNotificationsAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.Notifications.AnyAsync())
            return;

        var thabo = await context.Users.FirstOrDefaultAsync(u => u.Email == "thabo.molefe@ngila.demo");
        if (thabo is null)
        {
            logger.LogWarning("Skipped notification seeding - seed customer not found.");
            return;
        }

        var now = DateTime.UtcNow;

        context.Notifications.AddRange(
            new Notification
            {
                UserId = thabo.Id,
                Title = "Welcome to Ngila!",
                Body = "Discover street vendors near you and help grow your local economy.",
                IsRead = true,
                CreatedAt = now.AddDays(-2),
            },
            new Notification
            {
                UserId = thabo.Id,
                Title = "New vendor added near you",
                Body = "Sparkle Mobile Car Wash just joined Ngila in Braamfontein.",
                IsRead = false,
                CreatedAt = now.AddHours(-6),
            });

        await context.SaveChangesAsync();
        logger.LogInformation("Seeded 2 demo notifications.");
    }

    private sealed record DemoVendorSeed(
        string FirstName,
        string LastName,
        string Email,
        string BusinessName,
        string Description,
        string CategoryName,
        string Location,
        decimal Latitude,
        decimal Longitude,
        TimeSpan OpeningTime,
        TimeSpan ClosingTime,
        VendorStatus Status,
        decimal Rating,
        int ReviewsCount,
        string ImageUrl);
}
