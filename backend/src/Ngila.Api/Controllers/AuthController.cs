using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Common;
using Ngila.Api.DTOs.Auth;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register/customer")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterCustomer(RegisterCustomerRequest request, CancellationToken ct)
    {
        var result = await _authService.RegisterCustomerAsync(request, ct);
        return FromResult(result);
    }

    [HttpPost("register/vendor")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterVendor(RegisterVendorRequest request, CancellationToken ct)
    {
        var result = await _authService.RegisterVendorAsync(request, ct);
        return FromResult(result);
    }

    // Only an authenticated Admin can create another Admin - there is no public self-registration
    // route for this role.
    [HttpPost("register/admin")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RegisterAdmin(RegisterAdminRequest request, CancellationToken ct)
    {
        var result = await _authService.RegisterAdminAsync(request, ct);
        return FromResult(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await _authService.LoginAsync(request, GetClientIp(), ct);
        return FromResult(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, GetClientIp(), ct);
        return FromResult(result);
    }

    [HttpPost("revoke")]
    [AllowAnonymous]
    public async Task<IActionResult> Revoke(RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await _authService.RevokeTokenAsync(request.RefreshToken, GetClientIp(), ct);
        return FromResult(result);
    }

    [HttpPost("confirm-email")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmail(ConfirmEmailRequest request, CancellationToken ct)
    {
        var result = await _authService.ConfirmEmailAsync(request.UserId, request.Token, ct);
        return FromResult(result);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken ct)
    {
        var result = await _authService.ForgotPasswordAsync(request.Email, ct);
        return FromResult(result);
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken ct)
    {
        var result = await _authService.ResetPasswordAsync(request, ct);
        return FromResult(result);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        var result = await _authService.ChangePasswordAsync(User.GetUserId(), request, ct);
        return FromResult(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var result = await _authService.GetCurrentUserAsync(User.GetUserId(), ct);
        return FromResult(result);
    }

    private string? GetClientIp() =>
        HttpContext.Connection.RemoteIpAddress?.ToString();

    private IActionResult FromResult<T>(ServiceResult<T> result)
    {
        if (result.Succeeded)
            return StatusCode(result.StatusCode, result.Data);

        return StatusCode(result.StatusCode, new ProblemDetails
        {
            Title = result.Error,
            Status = result.StatusCode
        });
    }
}
