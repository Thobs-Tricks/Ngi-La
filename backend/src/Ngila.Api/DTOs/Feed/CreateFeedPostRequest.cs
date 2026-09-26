namespace Ngila.Api.DTOs.Feed;

public record CreateFeedPostRequest(
    string Content,
    Guid? VendorId,
    IReadOnlyList<string>? PhotoUrls);
