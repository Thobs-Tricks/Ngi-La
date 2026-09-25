namespace Ngila.Api.DTOs.Vendors;

public record VerificationQueueItemResponse(
    Guid Id,
    string BusinessName,
    string Category,
    string Location,
    string ClaimantName,
    string ClaimantEmail,
    string? AddedByName,
    string? Description,
    string? Image,
    string SubmittedAt);
