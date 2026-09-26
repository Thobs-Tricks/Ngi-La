using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Common;
using Ngila.Api.DTOs.Feed;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

// No class-level [AllowAnonymous] - see VendorsController for why that would silently defeat
// the [Authorize] on the mutating actions below.
[ApiController]
[Route("api/feed")]
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
    [AllowAnonymous]
    public async Task<IActionResult> GetFeed([FromQuery] int? take, CancellationToken ct)
    {
        var effectiveTake = Math.Clamp(take ?? DefaultTake, 1, MaxTake);
        var feed = await _feedService.GetFeedAsync(effectiveTake, User.GetUserIdOrNull(), ct);
        return Ok(feed);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreatePost(CreateFeedPostRequest request, CancellationToken ct)
    {
        var displayRole = User.IsInRole(Roles.Vendor) ? "Vendor Rep" : User.IsInRole(Roles.Admin) ? "Ngila Team" : "Community Scout";
        var result = await _feedService.CreatePostAsync(User.GetUserId(), displayRole, request, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpPost("{id:guid}/like")]
    [Authorize]
    public async Task<IActionResult> ToggleLike(Guid id, CancellationToken ct)
    {
        var result = await _feedService.ToggleLikeAsync(id, User.GetUserId(), ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpGet("{id:guid}/comments")]
    [AllowAnonymous]
    public async Task<IActionResult> GetComments(Guid id, CancellationToken ct)
    {
        var result = await _feedService.GetCommentsAsync(id, ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpPost("{id:guid}/comments")]
    [Authorize]
    public async Task<IActionResult> AddComment(Guid id, CreateCommentRequest request, CancellationToken ct)
    {
        var result = await _feedService.AddCommentAsync(id, User.GetUserId(), request, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }
}
