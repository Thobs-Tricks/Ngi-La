namespace Ngila.Api.DTOs.Feed;

public record CommentResponse(Guid Id, string User, string Avatar, string Content, string Time);
