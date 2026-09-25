using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Common;
using Ngila.Api.DTOs.Vendors;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

// No class-level [AllowAnonymous] here deliberately - actions are public by default in this API
// (no global fallback auth policy is configured), but AllowAnonymous at the class level would
// silently override the [Authorize] on the mutating actions below, since ASP.NET Core treats
// AllowAnonymous anywhere in the chain as "skip auth for this action" regardless of Authorize.
[ApiController]
[Route("api/vendors")]
[EnableRateLimiting("public-read")]
public class VendorsController : ControllerBase
{
    private const int MaxSearchLength = 100;

    private readonly IVendorService _vendorService;
    private readonly IReviewService _reviewService;
    private readonly IAuthService _authService;

    public VendorsController(IVendorService vendorService, IReviewService reviewService, IAuthService authService)
    {
        _vendorService = vendorService;
        _reviewService = reviewService;
        _authService = authService;
    }

    /// <summary>
    /// Browse vendors, optionally filtered by category/search and sorted by distance from
    /// the given coordinates. Coordinates default to Johannesburg CBD if omitted.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetVendors(
        [FromQuery] decimal? lat,
        [FromQuery] decimal? lng,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        if (!IsValidCoordinate(lat, lng, out var coordinateError))
            return Problem(title: coordinateError, statusCode: 400);

        if (search is { Length: > MaxSearchLength })
            return Problem(title: $"Search term must be {MaxSearchLength} characters or fewer.", statusCode: 400);

        var results = await _vendorService.GetVendorsAsync(new NearbyQuery(lat, lng, categoryId, search), ct);
        return Ok(results);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetVendor(Guid id, [FromQuery] decimal? lat, [FromQuery] decimal? lng, CancellationToken ct)
    {
        if (!IsValidCoordinate(lat, lng, out var coordinateError))
            return Problem(title: coordinateError, statusCode: 400);

        var vendor = await _vendorService.GetVendorByIdAsync(id, lat, lng, ct);
        return vendor is null ? NotFound() : Ok(vendor);
    }

    /// <summary>
    /// The calling vendor's own shop profile ("MySpaza"). 404 if they haven't set it up yet.
    /// </summary>
    [HttpGet("me")]
    [Authorize(Roles = Roles.Vendor)]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var result = await _vendorService.GetOwnProfileAsync(User.GetUserId(), ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    /// <summary>
    /// Creates the calling vendor's shop profile if they don't have one yet, or updates it if
    /// they do - what "MySpaza" setup/editing calls.
    /// </summary>
    [HttpPut("me")]
    [Authorize(Roles = Roles.Vendor)]
    public async Task<IActionResult> UpsertMyProfile(UpsertVendorProfileRequest request, CancellationToken ct)
    {
        var result = await _vendorService.UpsertOwnProfileAsync(User.GetUserId(), request, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    /// <summary>
    /// Community-add a vendor that isn't on Ngila yet. Starts unclaimed until the real
    /// business claims it via POST /api/vendors/{id}/claim.
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddVendor(AddVendorRequest request, CancellationToken ct)
    {
        try
        {
            var vendor = await _vendorService.AddVendorAsync(User.GetUserId(), request, ct);
            return CreatedAtAction(nameof(GetVendor), new { id = vendor.Id }, vendor);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: ex.Message, statusCode: 400);
        }
    }

    /// <summary>
    /// Claims an unclaimed (community-added) vendor listing by creating the owner's account
    /// and attaching it in one step.
    /// </summary>
    [HttpPost("{id:guid}/claim")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ClaimVendor(Guid id, ClaimVendorRequest request, CancellationToken ct)
    {
        var result = await _authService.ClaimVendorAsync(id, request, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpGet("{id:guid}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(Guid id, CancellationToken ct)
    {
        var result = await _reviewService.GetReviewsAsync(id, ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpPost("{id:guid}/reviews")]
    [Authorize]
    public async Task<IActionResult> SubmitReview(Guid id, ReviewRequest request, CancellationToken ct)
    {
        var result = await _reviewService.SubmitReviewAsync(id, User.GetUserId(), request, ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    /// <summary>
    /// Admin verification queue: vendors with a claimant awaiting a decision.
    /// </summary>
    [HttpGet("verification-queue")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetVerificationQueue(CancellationToken ct)
    {
        var queue = await _vendorService.GetVerificationQueueAsync(ct);
        return Ok(queue);
    }

    [HttpPost("{id:guid}/verify")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> VerifyVendor(Guid id, CancellationToken ct)
    {
        var result = await _vendorService.VerifyVendorAsync(id, User.GetUserId(), ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    /// <summary>
    /// Rejects the pending claim (reverts the listing to unclaimed) - not the same as suspending
    /// the listing itself.
    /// </summary>
    [HttpPost("{id:guid}/reject-claim")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RejectClaim(Guid id, CancellationToken ct)
    {
        var result = await _vendorService.RejectClaimAsync(id, User.GetUserId(), ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpPost("{id:guid}/request-info")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RequestInfo(Guid id, RequestInfoRequest request, CancellationToken ct)
    {
        var result = await _vendorService.RequestInfoAsync(id, request, ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    /// <summary>
    /// Full vendor list for the admin "Claims &amp; Vendors" table - includes suspended and
    /// unconfirmed listings that the public GET /api/vendors deliberately hides.
    /// </summary>
    [HttpGet("admin-list")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAdminVendors(CancellationToken ct)
    {
        var vendors = await _vendorService.GetAllForAdminAsync(ct);
        return Ok(vendors);
    }

    [HttpPost("{id:guid}/suspend")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> SuspendVendor(Guid id, CancellationToken ct)
    {
        var result = await _vendorService.SetSuspendedAsync(id, true, User.GetUserId(), ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpPost("{id:guid}/unsuspend")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> UnsuspendVendor(Guid id, CancellationToken ct)
    {
        var result = await _vendorService.SetSuspendedAsync(id, false, User.GetUserId(), ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    private static bool IsValidCoordinate(decimal? lat, decimal? lng, out string? error)
    {
        if (lat is < -90 or > 90)
        {
            error = "lat must be between -90 and 90.";
            return false;
        }

        if (lng is < -180 or > 180)
        {
            error = "lng must be between -180 and 180.";
            return false;
        }

        error = null;
        return true;
    }
}
