namespace Ngila.Api.DTOs.Feed;

public record FeedItemResponse(
    Guid Id,
    string User,
    string Role,
    string Time,
    string Content,
    Guid? VendorId,
    string? VendorName,
    string? VendorCategory,
    int Likes,
    int Comments,
    string Avatar,
    string? VendorImage,
    IReadOnlyList<string> Photos,
    bool LikedByMe);
