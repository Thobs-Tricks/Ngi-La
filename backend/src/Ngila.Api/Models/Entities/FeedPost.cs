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

    public Guid? VendorId { get; set; }
    public VendorProfile? Vendor { get; set; }

    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
