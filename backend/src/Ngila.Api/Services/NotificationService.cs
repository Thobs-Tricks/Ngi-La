using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Notifications;
using Ngila.Api.Models.Entities;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;

    public NotificationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<NotificationResponse>> GetNotificationsAsync(Guid userId, CancellationToken ct = default)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(ct);

        return notifications
            .Select(n => new NotificationResponse(
                n.Id, n.Title, n.Body, n.VendorId, n.IsRead, DisplayFormatting.RelativeTime(n.CreatedAt)))
            .ToList();
    }

    public async Task<ServiceResult<MessageResponse>> MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct);

        if (notification is null)
            return ServiceResult<MessageResponse>.Failure("Notification not found.", 404);

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync(ct);
        }

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Marked as read."));
    }

    public async Task<ServiceResult<MessageResponse>> MarkAllAsReadAsync(Guid userId, CancellationToken ct = default)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var notification in unread)
            notification.IsRead = true;

        if (unread.Count > 0)
            await _context.SaveChangesAsync(ct);

        return ServiceResult<MessageResponse>.Success(new MessageResponse($"Marked {unread.Count} notification(s) as read."));
    }

    public async Task NotifyAsync(Guid userId, string title, string body, Guid? vendorId = null, CancellationToken ct = default)
    {
        _context.Notifications.Add(new Notification
        {
            UserId = userId,
            Title = title,
            Body = body,
            VendorId = vendorId,
        });
        await _context.SaveChangesAsync(ct);
    }
}
