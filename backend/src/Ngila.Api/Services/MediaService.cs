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

    // .heic/.heif included because it's the default capture format on iPhones - rejecting it
    // outright silently broke every upload from an iOS photo library picker that hadn't been
    // re-encoded to jpeg first.
    private static readonly HashSet<string> ImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif" };

    // Some Android content:// picker URIs have no filename extension at all - the client always
    // sends a best-guess Content-Type on the multipart part even then, so this is the fallback
    // that keeps those uploads from being rejected just because the extension check found nothing.
    private static readonly HashSet<string> ImageContentTypes = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif" };

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
        var isRecognisedExtension = !string.IsNullOrEmpty(extension) && ImageExtensions.Contains(extension);
        var isRecognisedContentType = !string.IsNullOrEmpty(file.ContentType) && ImageContentTypes.Contains(file.ContentType);
        if (!isRecognisedExtension && !isRecognisedContentType)
            return ServiceResult<MediaUploadResponse>.Failure(
                "Unsupported file type. Allowed: jpg, jpeg, png, webp, gif, heic, heif.", 400);

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
                // Forces the delivered URL to always be a jpg regardless of the source format -
                // HEIC in particular (the iPhone default) doesn't render in React Native's Image
                // component or most browsers without this.
                Format = "jpg",
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
