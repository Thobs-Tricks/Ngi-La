namespace Ngila.Api.DTOs.Admin;

public record AdminResetPasswordRequest(string Email, string NewPassword);
