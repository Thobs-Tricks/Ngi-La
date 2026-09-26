using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Route("api/media")]
[Authorize]
[EnableRateLimiting("auth")]
public class MediaController : ControllerBase
{
    private readonly IMediaService _mediaService;

    public MediaController(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    /// <summary>
    /// Uploads a single image (multipart/form-data, field name "file") and returns its URL - used
    /// for vendor profile/gallery photos and feed post attachments (call once per photo; callers
    /// enforce the 5-photos-per-post/profile limit). Backed by Cloudinary, since this
    /// subscription's Azure policy disallows Storage accounts and the SQL free tier (32MB) can't
    /// hold real media. No video support.
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(12 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        var result = await _mediaService.UploadAsync(file, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }
}
