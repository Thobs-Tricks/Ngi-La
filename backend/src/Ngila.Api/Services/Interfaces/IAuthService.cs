using Ngila.Api.Common;
using Ngila.Api.DTOs.Auth;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Services.Interfaces;

public interface IAuthService
{
    Task<ServiceResult<MessageResponse>> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> RegisterVendorAsync(RegisterVendorRequest request, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> RegisterAdminAsync(RegisterAdminRequest request, CancellationToken ct = default);
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
