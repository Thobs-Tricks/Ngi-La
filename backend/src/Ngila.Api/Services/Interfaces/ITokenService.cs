using Ngila.Api.Models.Entities;

namespace Ngila.Api.Services.Interfaces;

public record GeneratedAccessToken(string Token, DateTime ExpiresAt);
public record GeneratedRefreshToken(string RawToken, RefreshToken Entity);

public interface ITokenService
{
    GeneratedAccessToken GenerateAccessToken(ApplicationUser user, IList<string> roles);
    GeneratedRefreshToken GenerateRefreshToken(Guid userId, string? createdByIp);
    string HashToken(string rawToken);
}
