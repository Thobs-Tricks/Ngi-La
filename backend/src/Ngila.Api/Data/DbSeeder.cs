using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Ngila.Api.Common;
using Ngila.Api.Configuration;
using Ngila.Api.Models.Entities;

namespace Ngila.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var adminSettings = services.GetRequiredService<IOptions<AdminBootstrapSettings>>().Value;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }

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
}
