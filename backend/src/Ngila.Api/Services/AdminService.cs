using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.DTOs.Common;
using Ngila.Api.Models.Entities;
using Ngila.Api.Models.Enums;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IActivityLogService _activityLog;

    public AdminService(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IActivityLogService activityLog)
    {
        _context = context;
        _userManager = userManager;
        _activityLog = activityLog;
    }

    public async Task<AdminStatsResponse> GetStatsAsync(CancellationToken ct = default)
    {
        var totalVendors = await _context.VendorProfiles.CountAsync(ct);
        var communityAdded = await _context.VendorProfiles.CountAsync(v => v.AddedByUserId != null, ct);
        var pendingVerification = await _context.VendorProfiles
            .CountAsync(v => v.Status == VendorStatus.PendingVerification && v.UserId != null, ct);
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive, ct);

        return new AdminStatsResponse(totalVendors, communityAdded, pendingVerification, activeUsers);
    }

    public async Task<IReadOnlyList<AdminUserResponse>> GetUsersAsync(CancellationToken ct = default)
    {
        var users = await _context.Users
            .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email, u.IsActive, u.CreatedAt })
            .ToListAsync(ct);

        var rolesByUserId = await (
            from userRole in _context.UserRoles
            join role in _context.Roles on userRole.RoleId equals role.Id
            select new { userRole.UserId, RoleName = role.Name! })
            .ToListAsync(ct);
        var roleLookup = rolesByUserId
            .GroupBy(x => x.UserId)
            .ToDictionary(g => g.Key, g => g.First().RoleName);

        var vendorsAddedByUserId = await _context.VendorProfiles
            .Where(v => v.AddedByUserId != null)
            .GroupBy(v => v.AddedByUserId!.Value)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        var reviewsByUserId = await _context.Reviews
            .GroupBy(r => r.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        return users
            .Select(u => new AdminUserResponse(
                u.Id,
                $"{u.FirstName} {u.LastName}",
                u.Email!,
                roleLookup.GetValueOrDefault(u.Id, "Unknown"),
                u.IsActive,
                u.CreatedAt.ToString("MMM yyyy"),
                vendorsAddedByUserId.GetValueOrDefault(u.Id, 0),
                reviewsByUserId.GetValueOrDefault(u.Id, 0)))
            .OrderByDescending(u => u.VendorsAdded + u.ReviewsWritten)
            .ToList();
    }

    public async Task<ServiceResult<AdminUserResponse>> SetUserActiveAsync(Guid targetUserId, bool active, Guid adminUserId, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == targetUserId, ct);
        if (user is null)
            return ServiceResult<AdminUserResponse>.Failure("User not found.", 404);

        var role = await GetRoleNameAsync(targetUserId, ct);
        if (role == Roles.Admin)
            return ServiceResult<AdminUserResponse>.Failure("Admin accounts can't be suspended here.", 400);

        if (user.IsActive == active)
            return ServiceResult<AdminUserResponse>.Failure(
                active ? "This account isn't suspended." : "This account is already suspended.", 400);

        user.IsActive = active;
        await _context.SaveChangesAsync(ct);

        // Suspending revokes every active session, same as an admin-triggered password reset -
        // otherwise a suspended user with a live refresh token could keep minting new access
        // tokens until it expires on its own.
        if (!active)
        {
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync(ct);
            foreach (var refreshToken in activeTokens)
            {
                refreshToken.RevokedAt = DateTime.UtcNow;
                refreshToken.ReasonRevoked = "Account was suspended by an admin";
            }
            if (activeTokens.Count > 0)
                await _context.SaveChangesAsync(ct);
        }

        await _activityLog.LogAsync(
            adminUserId,
            $"{(active ? "reinstated" : "suspended")} {user.Email}",
            active ? "user-reinstated" : "user-suspended", ct);

        var vendorsAdded = await _context.VendorProfiles.CountAsync(v => v.AddedByUserId == targetUserId, ct);
        var reviewsWritten = await _context.Reviews.CountAsync(r => r.UserId == targetUserId, ct);

        return ServiceResult<AdminUserResponse>.Success(new AdminUserResponse(
            user.Id,
            $"{user.FirstName} {user.LastName}",
            user.Email!,
            role,
            user.IsActive,
            user.CreatedAt.ToString("MMM yyyy"),
            vendorsAdded,
            reviewsWritten));
    }

    private async Task<string> GetRoleNameAsync(Guid userId, CancellationToken ct)
    {
        var roleName = await (
            from userRole in _context.UserRoles
            where userRole.UserId == userId
            join role in _context.Roles on userRole.RoleId equals role.Id
            select role.Name)
            .FirstOrDefaultAsync(ct);

        return roleName ?? "Unknown";
    }

    public async Task<ServiceResult<MessageResponse>> ResetUserPasswordAsync(Guid adminUserId, AdminResetPasswordRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return ServiceResult<MessageResponse>.Failure("No account with that email.", 404);

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
        if (!result.Succeeded)
            return ServiceResult<MessageResponse>.Failure(string.Join(" ", result.Errors.Select(e => e.Description)), 400);

        // Also confirm the account - there's no real email provider wired up yet, so this is the
        // only way an Admin can unblock a self-registered user whose confirmation email never
        // reached them.
        if (!user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);
        }

        // A password reset invalidates every existing session, same as the self-service reset.
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(ct);
        foreach (var refreshToken in activeTokens)
        {
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.ReasonRevoked = "Password was reset by an admin";
        }
        if (activeTokens.Count > 0)
            await _context.SaveChangesAsync(ct);

        await _activityLog.LogAsync(adminUserId, $"reset the password for {user.Email}", "password-reset-by-admin", ct);

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Password reset. The user can log in with the new password."));
    }
}
