using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Common;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = Roles.Admin)]
[EnableRateLimiting("public-read")]
public class AdminController : ControllerBase
{
    private const int DefaultActivityTake = 20;
    private const int MaxActivityTake = 100;

    private readonly IAdminService _adminService;
    private readonly IActivityLogService _activityLogService;
    private readonly IEmailSettingsService _emailSettingsService;

    public AdminController(IAdminService adminService, IActivityLogService activityLogService, IEmailSettingsService emailSettingsService)
    {
        _adminService = adminService;
        _activityLogService = activityLogService;
        _emailSettingsService = emailSettingsService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var stats = await _adminService.GetStatsAsync(ct);
        return Ok(stats);
    }

    [HttpGet("activity")]
    public async Task<IActionResult> GetActivity([FromQuery] int? take, CancellationToken ct)
    {
        var effectiveTake = Math.Clamp(take ?? DefaultActivityTake, 1, MaxActivityTake);
        var activity = await _activityLogService.GetRecentAsync(effectiveTake, ct);
        return Ok(activity);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        var users = await _adminService.GetUsersAsync(ct);
        return Ok(users);
    }

    /// <summary>
    /// Support tool: reset a user's password and mark their account confirmed. Useful when
    /// email delivery isn't configured yet (see GET/PUT email-settings below), or an email just
    /// never arrived - the confirmation/reset link is otherwise the only way in.
    /// </summary>
    [HttpPost("users/reset-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetUserPassword(AdminResetPasswordRequest request, CancellationToken ct)
    {
        var result = await _adminService.ResetUserPasswordAsync(User.GetUserId(), request, ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    /// <summary>
    /// The Gmail sender address/app password Ngila sends confirmation and password-reset emails
    /// from. AppPassword is never returned - only whether one is currently set.
    /// </summary>
    [HttpGet("email-settings")]
    public async Task<IActionResult> GetEmailSettings(CancellationToken ct)
    {
        var settings = await _emailSettingsService.GetAsync(ct);
        return Ok(settings);
    }

    [HttpPut("email-settings")]
    public async Task<IActionResult> UpdateEmailSettings(EmailSettingsRequest request, CancellationToken ct)
    {
        var result = await _emailSettingsService.UpdateAsync(User.GetUserId(), request, ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }
}
