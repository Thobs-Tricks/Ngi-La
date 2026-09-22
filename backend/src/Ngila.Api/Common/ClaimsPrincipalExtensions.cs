using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Ngila.Api.Common;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                    ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var id) ? id : throw new InvalidOperationException("User id claim missing or invalid.");
    }
}
