using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.Models.Entities;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly ApplicationDbContext _context;

    public ActivityLogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(Guid actorUserId, string description, string tone, CancellationToken ct = default)
    {
        _context.ActivityLogEntries.Add(new ActivityLogEntry
        {
            ActorUserId = actorUserId,
            Description = description,
            Tone = tone,
        });
        await _context.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<ActivityItemResponse>> GetRecentAsync(int take, CancellationToken ct = default)
    {
        var entries = await _context.ActivityLogEntries
            .Include(a => a.ActorUser)
            .OrderByDescending(a => a.CreatedAt)
            .Take(take)
            .ToListAsync(ct);

        return entries
            .Select(a => new ActivityItemResponse(
                a.Id,
                DisplayFormatting.DisplayName(a.ActorUser.FirstName, a.ActorUser.LastName),
                a.Description,
                DisplayFormatting.RelativeTime(a.CreatedAt),
                a.Tone))
            .ToList();
    }
}
