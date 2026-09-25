namespace Ngila.Api.DTOs.Notifications;

public record NotificationResponse(
    Guid Id,
    string Title,
    string Body,
    Guid? VendorId,
    bool IsRead,
    string Time);
