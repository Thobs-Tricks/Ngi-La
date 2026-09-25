namespace Ngila.Api.Models.Entities;

// Backs the admin dashboard's "Activity" feed. Written by other services at a small, deliberate
// set of trigger points (vendor added/claimed/verified, report resolved) - not a full audit log
// of every write in the system.
public class ActivityLogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ActorUserId { get; set; }
    public ApplicationUser ActorUser { get; set; } = default!;

    public string Description { get; set; } = default!;

    // Loosely-typed category driving the dashboard's colour-coded dot (e.g. "vendor-added",
    // "vendor-verified", "report-resolved") - display-only, not used for querying.
    public string Tone { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
