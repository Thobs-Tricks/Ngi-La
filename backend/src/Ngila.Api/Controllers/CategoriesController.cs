using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Route("api/categories")]
[AllowAnonymous]
[EnableRateLimiting("public-read")]
public class CategoriesController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public CategoriesController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var categories = await _vendorService.GetCategoriesAsync(ct);
        return Ok(categories);
    }
}
