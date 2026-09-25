using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Common;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
[EnableRateLimiting("public-read")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(CancellationToken ct)
    {
        var notifications = await _notificationService.GetNotificationsAsync(User.GetUserId(), ct);
        return Ok(notifications);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
    {
        var result = await _notificationService.MarkAsReadAsync(User.GetUserId(), id, ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        var result = await _notificationService.MarkAllAsReadAsync(User.GetUserId(), ct);
        return Ok(result.Data);
    }
}
