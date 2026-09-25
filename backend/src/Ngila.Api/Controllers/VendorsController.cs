using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Route("api/vendors")]
[AllowAnonymous]
[EnableRateLimiting("public-read")]
public class VendorsController : ControllerBase
{
    private const int MaxSearchLength = 100;

    private readonly IVendorService _vendorService;

    public VendorsController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    /// <summary>
    /// Browse vendors, optionally filtered by category/search and sorted by distance from
    /// the given coordinates. Coordinates default to Johannesburg CBD if omitted.
    /// </summary>
    [HttpGet]
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
    public async Task<IActionResult> GetVendor(Guid id, [FromQuery] decimal? lat, [FromQuery] decimal? lng, CancellationToken ct)
    {
        if (!IsValidCoordinate(lat, lng, out var coordinateError))
            return Problem(title: coordinateError, statusCode: 400);

        var vendor = await _vendorService.GetVendorByIdAsync(id, lat, lng, ct);
        return vendor is null ? NotFound() : Ok(vendor);
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
