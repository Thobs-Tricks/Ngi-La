using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Common;
using Ngila.Api.DTOs.Vendors;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

// No class-level [AllowAnonymous] - see VendorsController for why that would silently defeat
// the [Authorize(Policy = ...)] on the create action below.
[ApiController]
[Route("api/categories")]
[EnableRateLimiting("public-read")]
public class CategoriesController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public CategoriesController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var categories = await _vendorService.GetCategoriesAsync(ct);
        return Ok(categories);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> CreateCategory(CategoryCreateRequest request, CancellationToken ct)
    {
        var result = await _vendorService.CreateCategoryAsync(request, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }
}
