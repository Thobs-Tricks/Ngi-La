using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Ngila.Api.Common;
using Ngila.Api.Configuration;
using Ngila.Api.DTOs.Media;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

// Images only - no video upload support (posts/profiles are capped at 5 photos each; video was
// dropped from scope entirely).
public class MediaService : IMediaService
{
    private const long MaxImageBytes = 10 * 1024 * 1024; // 10 MB

    private static readonly HashSet<string> ImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    private readonly CloudinarySettings _settings;
    private readonly ILogger<MediaService> _logger;

    public MediaService(IOptions<CloudinarySettings> settings, ILogger<MediaService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<ServiceResult<MediaUploadResponse>> UploadAsync(IFormFile file, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.CloudName) || string.IsNullOrWhiteSpace(_settings.ApiKey) || string.IsNullOrWhiteSpace(_settings.ApiSecret))
            return ServiceResult<MediaUploadResponse>.Failure("Media upload isn't configured on this server yet.", 503);

        if (file.Length == 0)
            return ServiceResult<MediaUploadResponse>.Failure("File is empty.", 400);

        var extension = Path.GetExtension(file.FileName);
        if (!ImageExtensions.Contains(extension))
            return ServiceResult<MediaUploadResponse>.Failure(
                "Unsupported file type. Allowed: jpg, jpeg, png, webp, gif.", 400);

        if (file.Length > MaxImageBytes)
            return ServiceResult<MediaUploadResponse>.Failure(
                $"File is too large. Max size is {MaxImageBytes / (1024 * 1024)} MB.", 400);

        try
        {
            var cloudinary = new Cloudinary(new Account(_settings.CloudName, _settings.ApiKey, _settings.ApiSecret));
            await using var stream = file.OpenReadStream();

            var result = await cloudinary.UploadAsync(new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "ngila",
            }, ct);

            if (result.Error is not null)
            {
                _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
                return ServiceResult<MediaUploadResponse>.Failure("Upload failed. Please try again.", 502);
            }

            return ServiceResult<MediaUploadResponse>.Success(
                new MediaUploadResponse(result.SecureUrl.ToString(), "image"), 201);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cloudinary upload threw an exception");
            return ServiceResult<MediaUploadResponse>.Failure("Upload failed. Please try again.", 502);
        }
    }
}
