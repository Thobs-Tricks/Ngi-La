using Ngila.Api.Common;
using Ngila.Api.DTOs.Auth;
using Ngila.Api.DTOs.Common;

namespace Ngila.Api.Services.Interfaces;

public interface IAuthService
{
    // Creating UserType.Admin requires callerIsAdmin - true only when the caller already holds a
    // valid Admin session. There's no other gate now that Customer/Vendor/Admin registration
    // share one endpoint.
    Task<ServiceResult<MessageResponse>> RegisterAsync(RegisterRequest request, bool callerIsAdmin, CancellationToken ct = default);
    Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default);
    Task<ServiceResult<AuthResponse>> RefreshTokenAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> RevokeTokenAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ConfirmEmailAsync(Guid userId, string token, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ForgotPasswordAsync(string email, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);
    Task<ServiceResult<CurrentUserResponse>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
}
