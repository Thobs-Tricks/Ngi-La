using Ngila.Api.Common;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Notifications;

namespace Ngila.Api.Services.Interfaces;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationResponse>> GetNotificationsAsync(Guid userId, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> MarkAllAsReadAsync(Guid userId, CancellationToken ct = default);

    // Not exposed via a controller - called internally by other services (e.g. when a
    // community-added vendor gets claimed) to notify a user.
    Task NotifyAsync(Guid userId, string title, string body, Guid? vendorId = null, CancellationToken ct = default);
}
