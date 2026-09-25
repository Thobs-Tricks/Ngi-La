using Ngila.Api.Common;
using Ngila.Api.DTOs.Auth;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Services.Interfaces;

public interface IAuthService
{
    // Creating UserType.Admin requires callerCanCreateAdmins - true only when the caller already
    // holds a valid Admin session with AdminTitle.OperationsAdmin. There's no other gate now that
    // Customer/Vendor/Admin registration share one endpoint.
    Task<ServiceResult<MessageResponse>> RegisterAsync(RegisterRequest request, bool callerCanCreateAdmins, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ClaimVendorAsync(Guid vendorId, ClaimVendorRequest request, CancellationToken ct = default);
    Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default);
    Task<ServiceResult<AuthResponse>> RefreshTokenAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> RevokeTokenAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ConfirmEmailAsync(Guid userId, string token, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ForgotPasswordAsync(string email, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);
    Task<ServiceResult<CurrentUserResponse>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
}
