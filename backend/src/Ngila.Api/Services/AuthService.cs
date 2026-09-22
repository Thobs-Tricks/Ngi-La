using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Auth;
using Ngila.Api.DTOs.Common;
using Ngila.Api.Models.Entities;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class AuthService : IAuthService
{
    private const string GenericLoginError = "Invalid email or password.";
    private const string GenericResetError = "Invalid or expired token.";

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        ApplicationDbContext context,
        ITokenService tokenService,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<ServiceResult<MessageResponse>> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var createResult = await CreateUserAsync(
            request.Email, request.FirstName, request.LastName, request.PhoneNumber, request.Password, Roles.Customer);

        if (!createResult.Succeeded || createResult.Data is null)
            return ServiceResult<MessageResponse>.Failure(createResult.Error!, createResult.StatusCode);

        var user = createResult.Data;

        _context.CustomerProfiles.Add(new CustomerProfile { UserId = user.Id });
        await _context.SaveChangesAsync(ct);

        var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        await transaction.CommitAsync(ct);

        await _emailService.SendEmailConfirmationAsync(user.Email!, user.Id, confirmationToken, ct);

        return ServiceResult<MessageResponse>.Success(
            new MessageResponse("Registration successful. Please check your email to confirm your account."), 201);
    }

    public async Task<ServiceResult<MessageResponse>> RegisterVendorAsync(RegisterVendorRequest request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var createResult = await CreateUserAsync(
            request.Email, request.FirstName, request.LastName, request.PhoneNumber, request.Password, Roles.Vendor);

        if (!createResult.Succeeded || createResult.Data is null)
            return ServiceResult<MessageResponse>.Failure(createResult.Error!, createResult.StatusCode);

        var user = createResult.Data;

        _context.VendorProfiles.Add(new VendorProfile
        {
            UserId = user.Id,
            BusinessName = request.BusinessName,
            Description = request.BusinessDescription
        });
        await _context.SaveChangesAsync(ct);

        var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        await transaction.CommitAsync(ct);

        await _emailService.SendEmailConfirmationAsync(user.Email!, user.Id, confirmationToken, ct);

        return ServiceResult<MessageResponse>.Success(
            new MessageResponse("Registration successful. Please check your email to confirm your account."), 201);
    }

    public async Task<ServiceResult<MessageResponse>> RegisterAdminAsync(RegisterAdminRequest request, CancellationToken ct = default)
    {
        // Only reachable via [Authorize(Roles = Roles.Admin)] on the controller action - an existing
        // admin must vouch for a new one. There is no public admin self-registration endpoint.
        var createResult = await CreateUserAsync(
            request.Email, request.FirstName, request.LastName, request.PhoneNumber, request.Password, Roles.Admin);

        if (!createResult.Succeeded || createResult.Data is null)
            return ServiceResult<MessageResponse>.Failure(createResult.Error!, createResult.StatusCode);

        var user = createResult.Data;

        // Admin accounts are created by a trusted peer, so treat email as pre-confirmed rather than
        // routing through the public confirmation flow.
        user.EmailConfirmed = true;
        await _userManager.UpdateAsync(user);

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Admin account created successfully."), 201);
    }

    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            // Constant-shaped failure path so response timing/content doesn't reveal account existence.
            return ServiceResult<AuthResponse>.Failure(GenericLoginError, 401);
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login attempt on disabled account {UserId}", user.Id);
            return ServiceResult<AuthResponse>.Failure(GenericLoginError, 401);
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (signInResult.IsLockedOut)
        {
            return ServiceResult<AuthResponse>.Failure(
                "Account temporarily locked due to multiple failed login attempts. Please try again later.", 423);
        }

        if (!signInResult.Succeeded)
        {
            return ServiceResult<AuthResponse>.Failure(GenericLoginError, 401);
        }

        if (!user.EmailConfirmed)
        {
            return ServiceResult<AuthResponse>.Failure("Please confirm your email address before logging in.", 403);
        }

        var response = await IssueTokensAsync(user, ipAddress, ct);

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return ServiceResult<AuthResponse>.Success(response);
    }

    public async Task<ServiceResult<AuthResponse>> RefreshTokenAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default)
    {
        var tokenHash = _tokenService.HashToken(rawRefreshToken);
        var existingToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);

        if (existingToken is null)
            return ServiceResult<AuthResponse>.Failure("Invalid refresh token.", 401);

        if (existingToken.IsRevoked)
        {
            // Reuse of a revoked token is a strong signal of token theft: burn every active session.
            _logger.LogWarning("Refresh token reuse detected for user {UserId}. Revoking all sessions.", existingToken.UserId);
            await RevokeAllActiveTokensAsync(existingToken.UserId, ipAddress, "Token reuse detected", ct);
            return ServiceResult<AuthResponse>.Failure("Invalid refresh token. All sessions have been revoked for your safety.", 401);
        }

        if (existingToken.IsExpired)
            return ServiceResult<AuthResponse>.Failure("Refresh token has expired. Please log in again.", 401);

        var user = existingToken.User;
        if (!user.IsActive)
            return ServiceResult<AuthResponse>.Failure("Account is disabled.", 403);

        var newRefreshToken = _tokenService.GenerateRefreshToken(user.Id, ipAddress);

        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.RevokedByIp = ipAddress;
        existingToken.ReasonRevoked = "Replaced by new token";
        existingToken.ReplacedByTokenHash = newRefreshToken.Entity.TokenHash;

        _context.RefreshTokens.Add(newRefreshToken.Entity);
        await _context.SaveChangesAsync(ct);

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);

        return ServiceResult<AuthResponse>.Success(new AuthResponse(
            user.Id, user.Email!, user.FirstName, user.LastName, roles.FirstOrDefault() ?? string.Empty,
            accessToken.Token, accessToken.ExpiresAt,
            newRefreshToken.RawToken, newRefreshToken.Entity.ExpiresAt));
    }

    public async Task<ServiceResult<MessageResponse>> RevokeTokenAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default)
    {
        var tokenHash = _tokenService.HashToken(rawRefreshToken);
        var existingToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);

        if (existingToken is null)
            return ServiceResult<MessageResponse>.Failure("Invalid refresh token.", 400);

        if (existingToken.IsActive)
        {
            existingToken.RevokedAt = DateTime.UtcNow;
            existingToken.RevokedByIp = ipAddress;
            existingToken.ReasonRevoked = "Revoked by user";
            await _context.SaveChangesAsync(ct);
        }

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Logged out successfully."));
    }

    public async Task<ServiceResult<MessageResponse>> ConfirmEmailAsync(Guid userId, string token, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return ServiceResult<MessageResponse>.Failure("Invalid confirmation link.", 400);

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded)
            return ServiceResult<MessageResponse>.Failure("Invalid or expired confirmation link.", 400);

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Email confirmed successfully. You can now log in."));
    }

    public async Task<ServiceResult<MessageResponse>> ForgotPasswordAsync(string email, CancellationToken ct = default)
    {
        const string genericMessage = "If an account with that email exists, a password reset link has been sent.";

        var user = await _userManager.FindByEmailAsync(email);
        if (user is not null && user.IsActive)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            await _emailService.SendPasswordResetAsync(user.Email!, token, ct);
        }

        // Always return the same response regardless of whether the account exists.
        return ServiceResult<MessageResponse>.Success(new MessageResponse(genericMessage));
    }

    public async Task<ServiceResult<MessageResponse>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return ServiceResult<MessageResponse>.Failure(GenericResetError, 400);

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
            return ServiceResult<MessageResponse>.Failure(GenericResetError, 400);

        // A password reset invalidates every existing session as a precaution.
        await RevokeAllActiveTokensAsync(user.Id, null, "Password was reset", ct);

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Password reset successfully. Please log in with your new password."));
    }

    public async Task<ServiceResult<MessageResponse>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return ServiceResult<MessageResponse>.Failure("User not found.", 404);

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            return ServiceResult<MessageResponse>.Failure(string.Join(" ", result.Errors.Select(e => e.Description)), 400);

        await RevokeAllActiveTokensAsync(user.Id, null, "Password was changed", ct);

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Password changed successfully."));
    }

    public async Task<ServiceResult<CurrentUserResponse>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return ServiceResult<CurrentUserResponse>.Failure("User not found.", 404);

        var roles = await _userManager.GetRolesAsync(user);

        return ServiceResult<CurrentUserResponse>.Success(new CurrentUserResponse(
            user.Id, user.Email!, user.FirstName, user.LastName, user.PhoneNumber,
            roles.FirstOrDefault() ?? string.Empty, user.EmailConfirmed, user.CreatedAt));
    }

    private async Task<ServiceResult<ApplicationUser>> CreateUserAsync(
        string email, string firstName, string lastName, string? phoneNumber, string password, string role)
    {
        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
            return ServiceResult<ApplicationUser>.Failure("An account with this email already exists.", 409);

        if (!await _roleManager.RoleExistsAsync(role))
            await _roleManager.CreateAsync(new IdentityRole<Guid>(role));

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = phoneNumber,
        };

        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(" ", createResult.Errors.Select(e => e.Description));
            return ServiceResult<ApplicationUser>.Failure(errors, 400);
        }

        await _userManager.AddToRoleAsync(user, role);

        return ServiceResult<ApplicationUser>.Success(user);
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user, string? ipAddress, CancellationToken ct)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id, ipAddress);

        _context.RefreshTokens.Add(refreshToken.Entity);
        await _context.SaveChangesAsync(ct);

        return new AuthResponse(
            user.Id, user.Email!, user.FirstName, user.LastName, roles.FirstOrDefault() ?? string.Empty,
            accessToken.Token, accessToken.ExpiresAt,
            refreshToken.RawToken, refreshToken.Entity.ExpiresAt);
    }

    private async Task RevokeAllActiveTokensAsync(Guid userId, string? ipAddress, string reason, CancellationToken ct)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(ct);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;
            token.ReasonRevoked = reason;
        }

        if (activeTokens.Count > 0)
            await _context.SaveChangesAsync(ct);
    }
}
