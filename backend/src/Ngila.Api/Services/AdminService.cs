using Microsoft.EntityFrameworkCore;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.Models.Enums;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminStatsResponse> GetStatsAsync(CancellationToken ct = default)
    {
        var totalVendors = await _context.VendorProfiles.CountAsync(ct);
        var communityAdded = await _context.VendorProfiles.CountAsync(v => v.AddedByUserId != null, ct);
        var pendingVerification = await _context.VendorProfiles
            .CountAsync(v => v.Status == VendorStatus.PendingVerification && v.UserId != null, ct);
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive, ct);
        var reportsOpen = await _context.Reports.CountAsync(r => !r.IsResolved, ct);

        return new AdminStatsResponse(totalVendors, communityAdded, pendingVerification, activeUsers, reportsOpen);
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
}
