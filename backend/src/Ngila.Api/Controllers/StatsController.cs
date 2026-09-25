using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Route("api/stats")]
[AllowAnonymous]
[EnableRateLimiting("public-read")]
public class StatsController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public StatsController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var stats = await _vendorService.GetStatsAsync(ct);
        return Ok(stats);
    }
}
