namespace Ngila.Api.Models.Enums;

// Sub-role within the Admin account type - drives which admin-only actions a given Admin can
// take. Every Admin still shares one Identity role ("Admin"); this is a finer-grained permission
// tier layered on top, carried as a JWT claim (see TokenService) and checked via named
// authorization policies (see Program.cs) rather than IdentityRole membership.
public enum AdminTitle
{
    OperationsAdmin = 0,
    VerificationReviewer = 1,
    CommunityManager = 2
}
