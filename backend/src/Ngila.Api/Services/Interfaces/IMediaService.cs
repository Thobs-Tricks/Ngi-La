using Microsoft.AspNetCore.Http;
using Ngila.Api.Common;
using Ngila.Api.DTOs.Media;

namespace Ngila.Api.Services.Interfaces;

public interface IMediaService
{
    Task<ServiceResult<MediaUploadResponse>> UploadAsync(IFormFile file, CancellationToken ct = default);
}
