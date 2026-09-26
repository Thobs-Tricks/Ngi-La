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

    // Only used to pick random subsets/orderings of already-fixed seed data - not a source of
    // real randomness that needs to be reproducible, since every step here is idempotent (guarded
    // by existence checks) and only ever runs meaningfully once per environment.
    private static readonly Random Rng = new();

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
        await SeedNotificationsAsync(context, logger);

        // These three run on every startup, not just against an empty table - each one tops up
        // or resyncs whatever's missing rather than bailing out early, so they also backfill
        // real (non-seed) vendors/posts/customers created through ordinary use of the app.
        await SeedReviewsAsync(context, logger);
        await SeedFeedEngagementAsync(context, logger);
        await ConfirmAllCustomerEmailsAsync(context, logger);
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

    // The 7 Unsplash photo IDs below are the only ones ever verified to load correctly for this
    // project - reused (not duplicated with new, unverified IDs) as both a vendor's main image
    // and its feed posts' photos, for every vendor added here.
    private static readonly string[] StockImages =
    {
        "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    };

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
                new TimeSpan(7, 0, 0), new TimeSpan(18, 0, 0), VendorStatus.Verified, StockImages[0]),
            new DemoVendorSeed(
                "Sipho", "Ndlovu", "sipho.ndlovu@ngila.demo",
                "Sipho Fresh Produce", "Fresh fruit and vegetables sourced from local farmers and sold at affordable prices.",
                "Fresh Produce", "Braamfontein, Johannesburg", -26.1940m, 28.0320m,
                new TimeSpan(6, 30, 0), new TimeSpan(17, 0, 0), VendorStatus.PendingVerification, StockImages[1]),
            new DemoVendorSeed(
                "Kagiso", "Sithole", "kagiso.sithole@ngila.demo",
                "King's Cut Barber", "Professional cuts, fades and grooming services from experienced local barbers.",
                "Barber", "Braamfontein, Johannesburg", -26.1910m, 28.0295m,
                new TimeSpan(8, 0, 0), new TimeSpan(19, 0, 0), VendorStatus.Verified, StockImages[2]),
            new DemoVendorSeed(
                "Vusi", "Mahlangu", "vusi.mahlangu@ngila.demo",
                "Vusi Airtime & Accessories", "Airtime, data, phone accessories and everyday mobile essentials.",
                "Accessories", "Braamfontein, Johannesburg", -26.1950m, 28.0350m,
                new TimeSpan(8, 0, 0), new TimeSpan(18, 0, 0), VendorStatus.PendingVerification, StockImages[3]),
            new DemoVendorSeed(
                "Sello", "Radebe", "sello.radebe@ngila.demo",
                "Sello Shoe Repairs", "Affordable shoe repairs, restoration and maintenance for all types of footwear.",
                "Repairs", "Braamfontein, Johannesburg", -26.1890m, 28.0270m,
                new TimeSpan(8, 30, 0), new TimeSpan(17, 30, 0), VendorStatus.Verified, StockImages[4]),
            new DemoVendorSeed(
                "Lindiwe", "Zulu", "lindiwe.zulu@ngila.demo",
                "Sparkle Mobile Car Wash", "Convenient mobile car wash services brought directly to your location.",
                "Car Wash", "Braamfontein, Johannesburg", -26.1970m, 28.0400m,
                new TimeSpan(8, 0, 0), new TimeSpan(17, 0, 0), VendorStatus.PendingVerification, StockImages[5]),
            new DemoVendorSeed(
                "Joyce", "Mokoena", "joyce.mokoena@ngila.demo",
                "Auntie Joyce Vetkoek", "Freshly fried vetkoek and shisanyama favourites, a Braamfontein institution.",
                "Food", "Braamfontein, Johannesburg", -26.1920m, 28.0300m,
                new TimeSpan(7, 0, 0), new TimeSpan(15, 0, 0), VendorStatus.Verified, StockImages[6]),
            new DemoVendorSeed(
                "Zanele", "Mahlangu", "zanele.mahlangu@ngila.demo",
                "Zanele's Shisanyama", "Braai and shisanyama plates cooked over open coals every evening.",
                "Food", "Braamfontein, Johannesburg", -26.1905m, 28.0315m,
                new TimeSpan(10, 0, 0), new TimeSpan(20, 0, 0), VendorStatus.Verified, StockImages[0]),
            new DemoVendorSeed(
                "Thato", "Mokoena", "thato.mokoena@ngila.demo",
                "Thato Streetwear", "Locally sourced streetwear, sneakers and accessories at street prices.",
                "Clothing", "Braamfontein, Johannesburg", -26.1935m, 28.0360m,
                new TimeSpan(9, 0, 0), new TimeSpan(18, 0, 0), VendorStatus.Verified, StockImages[1]),
            new DemoVendorSeed(
                "Bongani", "Dlamini", "bongani.dlamini@ngila.demo",
                "Bongani Fashion House", "Tailored and ready-to-wear fashion for every occasion.",
                "Clothing", "Braamfontein, Johannesburg", -26.1900m, 28.0330m,
                new TimeSpan(9, 30, 0), new TimeSpan(18, 30, 0), VendorStatus.PendingVerification, StockImages[2]),
            new DemoVendorSeed(
                "Patricia", "Mahlangu", "patricia.mahlangu@ngila.demo",
                "Green Corner Grocer", "A neighbourhood grocer stocking fresh vegetables, fruit and pantry staples.",
                "Fresh Produce", "Braamfontein, Johannesburg", -26.1960m, 28.0290m,
                new TimeSpan(6, 0, 0), new TimeSpan(19, 0, 0), VendorStatus.Verified, StockImages[3]),
            new DemoVendorSeed(
                "Lucky", "Ngwenya", "lucky.ngwenya@ngila.demo",
                "Fade Masters", "Sharp fades, line-ups and beard grooming from a team of skilled barbers.",
                "Barber", "Braamfontein, Johannesburg", -26.1885m, 28.0340m,
                new TimeSpan(8, 0, 0), new TimeSpan(20, 0, 0), VendorStatus.Verified, StockImages[4]),
            new DemoVendorSeed(
                "Andile", "Khumalo", "andile.khumalo@ngila.demo",
                "Jozi Phone Repairs", "Same-day screen, battery and charging port repairs for most phone models.",
                "Repairs", "Braamfontein, Johannesburg", -26.1945m, 28.0370m,
                new TimeSpan(9, 0, 0), new TimeSpan(18, 0, 0), VendorStatus.PendingVerification, StockImages[5]),
            new DemoVendorSeed(
                "Precious", "Tshabalala", "precious.tshabalala@ngila.demo",
                "Shine Bright Wash Bay", "Full interior and exterior car washes with a 30-minute turnaround.",
                "Car Wash", "Braamfontein, Johannesburg", -26.1980m, 28.0280m,
                new TimeSpan(7, 30, 0), new TimeSpan(17, 30, 0), VendorStatus.Verified, StockImages[6]),
            new DemoVendorSeed(
                "Given", "Mabaso", "given.mabaso@ngila.demo",
                "Data Bundle Corner", "Airtime, data bundles and SIM swaps for every network.",
                "Accessories", "Braamfontein, Johannesburg", -26.1915m, 28.0355m,
                new TimeSpan(8, 0, 0), new TimeSpan(19, 0, 0), VendorStatus.PendingVerification, StockImages[0]),
            new DemoVendorSeed(
                "Thandi", "Mnisi", "thandi.mnisi@ngila.demo",
                "Mama Thandi's Kota Spot", "Loaded kotas and amagwinya, a favourite lunch stop for students nearby.",
                "Food", "Braamfontein, Johannesburg", -26.1930m, 28.0285m,
                new TimeSpan(7, 0, 0), new TimeSpan(16, 0, 0), VendorStatus.Verified, StockImages[1]),
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
                Categories = { categories[seed.CategoryName] },
                LocationDescription = seed.Location,
                Latitude = seed.Latitude,
                Longitude = seed.Longitude,
                TradingHours = EveryDay(seed.OpeningTime, seed.ClosingTime),
                Status = seed.Status,
                // Rating/ReviewsCount are left at their 0 default here - SeedReviewsAsync seeds
                // real Review rows for every vendor and recomputes both from that real data, so
                // there's never a fabricated number sitting in the database unbacked by rows.
                ImageUrl = seed.ImageUrl,
            });
        }

        var customerSeeds = new[]
        {
            ("Thabo", "Molefe", "thabo.molefe@ngila.demo"),
            ("Nomusa", "Khumalo", "nomusa.khumalo@ngila.demo"),
            ("Sipho", "Nkosi", "sipho.nkosi@ngila.demo"),
            ("Naledi", "Dube", "naledi.dube@ngila.demo"),
            ("Palesa", "Mokoena", "palesa.mokoena@ngila.demo"),
            ("Tumi", "Sithole", "tumi.sithole@ngila.demo"),
            ("Ayanda", "Zulu", "ayanda.zulu@ngila.demo"),
            ("Karabo", "Mahlangu", "karabo.mahlangu@ngila.demo"),
            ("Refilwe", "Nkosi", "refilwe.nkosi@ngila.demo"),
            ("Lerato", "Dlamini", "lerato.dlamini@ngila.demo"),
            ("Mpho", "Radebe", "mpho.radebe@ngila.demo"),
            ("Zinhle", "Ngwenya", "zinhle.ngwenya@ngila.demo"),
            ("Katlego", "Mabaso", "katlego.mabaso@ngila.demo"),
            ("Boitumelo", "Tshabalala", "boitumelo.tshabalala@ngila.demo"),
            ("Sibusiso", "Mnisi", "sibusiso.mnisi@ngila.demo"),
            ("Nokuthula", "Khumalo", "nokuthula.khumalo@ngila.demo"),
            ("Themba", "Molefe", "themba.molefe@ngila.demo"),
            ("Precious", "Sithole", "precious.sithole@ngila.demo"),
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

        var usersByEmail = await context.Users
            .Where(u => u.Email!.EndsWith("@ngila.demo"))
            .ToDictionaryAsync(u => u.Email!);
        var vendorsByName = await context.VendorProfiles.ToDictionaryAsync(v => v.BusinessName);

        var postSeeds = new[]
        {
            ("thabo.molefe@ngila.demo", "Auntie Joyce Vetkoek", "Community Scout", "Just discovered this amazing local spot!", -15),
            ("nomusa.khumalo@ngila.demo", "King's Cut Barber", "Local Explorer", "King's Cut never disappoints 🔥", -120),
            ("sipho.nkosi@ngila.demo", "Sipho Fresh Produce", "Vendor Rep", "Fresh stock just arrived! 🍎🥬", -300),
            ("naledi.dube@ngila.demo", "Sello Shoe Repairs", "Community Scout", "Got my takkies looking brand new again 👟", -540),
            ("nomusa.khumalo@ngila.demo", "Sparkle Mobile Car Wash", "Local Explorer", "Booked a mobile wash before work, car came out spotless ✨", -1080),
            ("palesa.mokoena@ngila.demo", "Zanele's Shisanyama", "Local Explorer", "Best chisa nyama in Braamfontein, hands down 🔥", -60),
            ("tumi.sithole@ngila.demo", "Thato Streetwear", "Community Scout", "Copped a fresh hoodie here, quality is unreal", -200),
            ("ayanda.zulu@ngila.demo", "Bongani Fashion House", "Local Explorer", "Bongani always has the freshest fits in stock", -260),
            ("karabo.mahlangu@ngila.demo", "Green Corner Grocer", "Community Scout", "Cheapest tomatoes and onions in the area, always fresh", -400),
            ("refilwe.nkosi@ngila.demo", "Fade Masters", "Local Explorer", "My go-to spot for a clean fade every two weeks", -480),
            ("lerato.dlamini@ngila.demo", "Jozi Phone Repairs", "Community Scout", "Fixed my cracked screen in 20 minutes flat", -600),
            ("mpho.radebe@ngila.demo", "Shine Bright Wash Bay", "Local Explorer", "Car looks brand new after every wash here", -720),
            ("zinhle.ngwenya@ngila.demo", "Data Bundle Corner", "Community Scout", "Cheapest data bundles around, never runs out of stock", -840),
            ("katlego.mabaso@ngila.demo", "Mama Thandi's Kota Spot", "Local Explorer", "The kota here is unmatched, ask for the special", -900),
            ("boitumelo.tshabalala@ngila.demo", "Mama Mary's Kitchen", "Local Explorer", "Still the best pap and chicken in Braamfontein", -960),
            ("sibusiso.mnisi@ngila.demo", "King's Cut Barber", "Community Scout", "Been coming here for two years, never disappoints", -1200),
            ("nokuthula.khumalo@ngila.demo", "Sipho Fresh Produce", "Local Explorer", "Great quality veggies, restocks fast", -1320),
            ("themba.molefe@ngila.demo", "Sello Shoe Repairs", "Community Scout", "Saved my favourite boots, great work", -1440),
            ("precious.sithole@ngila.demo", "Auntie Joyce Vetkoek", "Local Explorer", "Vetkoek and mince, an absolute must-try", -1560),
            ("naledi.dube@ngila.demo", "Zanele's Shisanyama", "Local Explorer", "Went back for seconds, the boerewors roll is huge", -1680),
        };

        var now = DateTime.UtcNow;
        var skipped = 0;

        foreach (var (authorEmail, vendorName, role, content, minutesAgo) in postSeeds)
        {
            if (!usersByEmail.TryGetValue(authorEmail, out var author) || !vendorsByName.TryGetValue(vendorName, out var vendor))
            {
                skipped++;
                continue;
            }

            context.FeedPosts.Add(new FeedPost
            {
                AuthorUserId = author.Id,
                AuthorDisplayRole = role,
                Content = content,
                VendorId = vendor.Id,
                CreatedAt = now.AddMinutes(minutesAgo),
                // LikesCount/CommentsCount are left at 0 here - SeedFeedEngagementAsync seeds real
                // FeedPostLike/FeedPostComment rows for every post and recomputes both from that
                // real data.
                Photos = vendor.ImageUrl is null
                    ? new List<FeedPostPhoto>()
                    : new List<FeedPostPhoto> { new() { Url = vendor.ImageUrl, SortOrder = 0 } },
            });
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} demo feed posts ({Skipped} skipped - missing author/vendor).",
            postSeeds.Length - skipped, skipped);
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

    // Every non-Admin account (customers and vendor owners both) is eligible to review, like or
    // comment - SubmitReview/ToggleLike/AddComment have no role restriction in the real API, so
    // a vendor owner reviewing another vendor's stall is realistic, not a seeding shortcut.
    private static async Task<List<Guid>> GetNonAdminUserIdsAsync(ApplicationDbContext context) =>
        await (
            from ur in context.UserRoles
            join r in context.Roles on ur.RoleId equals r.Id
            where r.Name != Roles.Admin
            select ur.UserId)
            .Distinct()
            .ToListAsync();

    private static readonly string?[] ReviewComments =
    {
        "Great service, will definitely come back.",
        "Exactly what I needed, fast and friendly.",
        "Quality is consistently good every time.",
        "A bit of a wait but worth it in the end.",
        "My new go-to spot in the area.",
        "Solid prices for the quality you get.",
        null,
        null,
    };

    private static readonly int[] ReviewRatings = { 5, 5, 5, 4, 4, 3 };

    // Tops up any vendor with fewer than 3 real reviews, then recomputes every vendor's
    // Rating/ReviewsCount from the actual Review rows that exist - never leaves a hand-set number
    // sitting in the database unbacked by real rows. Runs on every startup, so it also backfills
    // real (non-seed) vendors created through ordinary use of the app.
    private static async Task SeedReviewsAsync(ApplicationDbContext context, ILogger logger)
    {
        var reviewerIds = await GetNonAdminUserIdsAsync(context);
        if (reviewerIds.Count == 0)
            return;

        var vendors = await context.VendorProfiles.ToListAsync();
        if (vendors.Count == 0)
            return;

        var reviewerIdsByVendor = await context.Reviews
            .GroupBy(r => r.VendorId)
            .Select(g => new { VendorId = g.Key, UserIds = g.Select(r => r.UserId).ToList() })
            .ToDictionaryAsync(x => x.VendorId, x => new HashSet<Guid>(x.UserIds));

        var addedAny = false;
        foreach (var vendor in vendors)
        {
            var alreadyReviewedBy = reviewerIdsByVendor.GetValueOrDefault(vendor.Id) ?? new HashSet<Guid>();
            if (alreadyReviewedBy.Count >= 3)
                continue;

            var eligible = reviewerIds
                .Where(id => id != vendor.UserId && !alreadyReviewedBy.Contains(id))
                .OrderBy(_ => Rng.Next())
                .Take(Rng.Next(3, 9))
                .ToList();

            foreach (var reviewerId in eligible)
            {
                context.Reviews.Add(new Review
                {
                    VendorId = vendor.Id,
                    UserId = reviewerId,
                    Rating = ReviewRatings[Rng.Next(ReviewRatings.Length)],
                    Comment = ReviewComments[Rng.Next(ReviewComments.Length)],
                });
            }

            addedAny = addedAny || eligible.Count > 0;
        }

        if (!addedAny)
            return;

        await context.SaveChangesAsync();

        var aggregates = await context.Reviews
            .GroupBy(r => r.VendorId)
            .Select(g => new { VendorId = g.Key, Count = g.Count(), Average = g.Average(r => (double)r.Rating) })
            .ToDictionaryAsync(x => x.VendorId);

        foreach (var vendor in vendors)
        {
            if (aggregates.TryGetValue(vendor.Id, out var agg))
            {
                vendor.ReviewsCount = agg.Count;
                vendor.Rating = Math.Round((decimal)agg.Average, 2);
            }
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Seeded reviews and resynced vendor ratings from real review data.");
    }

    private static readonly string[] FeedComments =
    {
        "This looks amazing!",
        "Adding this to my list this weekend.",
        "So good, been going here for months.",
        "Thanks for sharing, needed this today.",
        "Underrated spot for real.",
        "Love supporting local like this.",
    };

    // Tops up any post with fewer than 5 real likes or 2 real comments, then recomputes every
    // post's LikesCount/CommentsCount from the actual FeedPostLike/FeedPostComment rows - same
    // real-data-only approach as SeedReviewsAsync above. Runs on every startup.
    private static async Task SeedFeedEngagementAsync(ApplicationDbContext context, ILogger logger)
    {
        var userIds = await GetNonAdminUserIdsAsync(context);
        if (userIds.Count == 0)
            return;

        var posts = await context.FeedPosts.ToListAsync();
        if (posts.Count == 0)
            return;

        var likerIdsByPost = await context.FeedPostLikes
            .GroupBy(l => l.FeedPostId)
            .Select(g => new { PostId = g.Key, UserIds = g.Select(l => l.UserId).ToList() })
            .ToDictionaryAsync(x => x.PostId, x => new HashSet<Guid>(x.UserIds));

        var commentCountByPost = await context.FeedPostComments
            .GroupBy(c => c.FeedPostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count);

        var addedAny = false;
        foreach (var post in posts)
        {
            var alreadyLikedBy = likerIdsByPost.GetValueOrDefault(post.Id) ?? new HashSet<Guid>();
            if (alreadyLikedBy.Count < 5)
            {
                var likers = userIds
                    .Where(id => id != post.AuthorUserId && !alreadyLikedBy.Contains(id))
                    .OrderBy(_ => Rng.Next())
                    .Take(Rng.Next(5, Math.Min(userIds.Count, 25) + 1))
                    .ToList();

                context.FeedPostLikes.AddRange(likers.Select(id => new FeedPostLike { FeedPostId = post.Id, UserId = id }));
                addedAny = addedAny || likers.Count > 0;
            }

            if (commentCountByPost.GetValueOrDefault(post.Id) < 2)
            {
                var commenters = userIds
                    .Where(id => id != post.AuthorUserId)
                    .OrderBy(_ => Rng.Next())
                    .Take(Rng.Next(2, 6))
                    .ToList();

                context.FeedPostComments.AddRange(commenters.Select(id => new FeedPostComment
                {
                    FeedPostId = post.Id,
                    UserId = id,
                    Content = FeedComments[Rng.Next(FeedComments.Length)],
                }));
                addedAny = addedAny || commenters.Count > 0;
            }
        }

        if (!addedAny)
            return;

        await context.SaveChangesAsync();

        var likeCounts = await context.FeedPostLikes.GroupBy(l => l.FeedPostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count);
        var commentCounts = await context.FeedPostComments.GroupBy(c => c.FeedPostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count);

        foreach (var post in posts)
        {
            post.LikesCount = likeCounts.GetValueOrDefault(post.Id);
            post.CommentsCount = commentCounts.GetValueOrDefault(post.Id);
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Seeded feed engagement and resynced like/comment counts from real data.");
    }

    // Every Customer account gets EmailConfirmed = true, including ones created through ordinary
    // self-registration that never clicked their confirmation link - runs on every startup.
    private static async Task ConfirmAllCustomerEmailsAsync(ApplicationDbContext context, ILogger logger)
    {
        var unconfirmedCustomerIds = await (
            from u in context.Users
            join ur in context.UserRoles on u.Id equals ur.UserId
            join r in context.Roles on ur.RoleId equals r.Id
            where r.Name == Roles.Customer && !u.EmailConfirmed
            select u.Id)
            .ToListAsync();

        if (unconfirmedCustomerIds.Count == 0)
            return;

        await context.Users
            .Where(u => unconfirmedCustomerIds.Contains(u.Id))
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.EmailConfirmed, true));

        logger.LogInformation("Marked {Count} customer account(s) email-confirmed.", unconfirmedCustomerIds.Count);
    }

    // Same hours every day of the week - just enough for seed data to have a working "open now"
    // status; a real vendor edits this per-day via PUT /api/vendors/me.
    private static List<VendorTradingHours> EveryDay(TimeSpan openingTime, TimeSpan closingTime) =>
        Enum.GetValues<DayOfWeek>()
            .Select(day => new VendorTradingHours { DayOfWeek = day, IsOpen = true, OpenTime = openingTime, CloseTime = closingTime })
            .ToList();

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
        string ImageUrl);
}
