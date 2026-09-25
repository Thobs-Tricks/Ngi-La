using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Route("api/feed")]
[AllowAnonymous]
[EnableRateLimiting("public-read")]
public class FeedController : ControllerBase
{
    private const int DefaultTake = 20;
    private const int MaxTake = 50;

    private readonly IFeedService _feedService;

    public FeedController(IFeedService feedService)
    {
        _feedService = feedService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFeed([FromQuery] int? take, CancellationToken ct)
    {
        var effectiveTake = Math.Clamp(take ?? DefaultTake, 1, MaxTake);
        var feed = await _feedService.GetFeedAsync(effectiveTake, ct);
        return Ok(feed);
    }
}
