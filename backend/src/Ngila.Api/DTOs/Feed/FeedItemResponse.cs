namespace Ngila.Api.DTOs.Feed;

public record FeedItemResponse(
    Guid Id,
    string User,
    string Role,
    string Time,
    string Content,
    string? VendorName,
    string? VendorCategory,
    int Likes,
    int Comments,
    string Avatar,
    string? VendorImage);
