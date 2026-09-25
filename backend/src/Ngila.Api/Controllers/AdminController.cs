using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Common;
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

    public AdminController(IAdminService adminService, IActivityLogService activityLogService)
    {
        _adminService = adminService;
        _activityLogService = activityLogService;
    }

    /// <summary>
    /// Dashboard overview counts. Available to every Admin sub-role - read-only, no PII beyond
    /// aggregate numbers.
    /// </summary>
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
    [Authorize(Policy = AdminPolicies.CanViewUsers)]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        var users = await _adminService.GetUsersAsync(ct);
        return Ok(users);
    }
}
