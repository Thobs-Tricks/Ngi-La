namespace Ngila.Api.Models.Entities;

public class FeedPost
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid AuthorUserId { get; set; }
    public ApplicationUser AuthorUser { get; set; } = default!;

    // Flavour text shown next to the author's name (e.g. "Community Scout", "Vendor Rep").
    // Set only by seed data / future moderation tooling - never user-supplied, so it carries no
    // access-control meaning and is safe to leave freeform.
    public string AuthorDisplayRole { get; set; } = default!;

    public string Content { get; set; } = default!;

    // Max 5, enforced in FeedService - not declaratively enforceable at the DB level.
    public ICollection<FeedPostPhoto> Photos { get; set; } = new List<FeedPostPhoto>();

    public Guid? VendorId { get; set; }
    public VendorProfile? Vendor { get; set; }

    // Denormalized counters, kept in sync by FeedService whenever a like/comment is
    // added or removed - avoids a COUNT(*) join every time the feed is read.
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FeedPostPhoto
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FeedPostId { get; set; }
    public FeedPost FeedPost { get; set; } = default!;

    public string Url { get; set; } = default!;
    public int SortOrder { get; set; }
}

public class FeedPostLike
{
    public Guid FeedPostId { get; set; }
    public FeedPost FeedPost { get; set; } = default!;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FeedPostComment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FeedPostId { get; set; }
    public FeedPost FeedPost { get; set; } = default!;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = default!;

    public string Content { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
