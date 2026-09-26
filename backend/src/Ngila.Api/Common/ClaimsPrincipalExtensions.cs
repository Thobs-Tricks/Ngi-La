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

    // For endpoints that behave differently for an authenticated caller but still allow
    // anonymous access (e.g. the feed, to show "liked by me" only when logged in).
    public static Guid? GetUserIdOrNull(this ClaimsPrincipal principal)
    {
        if (principal.Identity?.IsAuthenticated != true)
            return null;

        var value = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                    ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var id) ? id : null;
    }
}
