namespace Ngila.Api.DTOs.Auth;

public record ConfirmEmailRequest(Guid UserId, string Token);
