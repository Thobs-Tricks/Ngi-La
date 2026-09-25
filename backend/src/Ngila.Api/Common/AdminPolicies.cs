namespace Ngila.Api.Common;

// Named authorization policies for Admin sub-roles (AdminTitle). Central place documenting the
// permission matrix so it isn't scattered across controllers as magic strings.
//
//                              | OperationsAdmin | VerificationReviewer | CommunityManager |
// CanManageVendorVerification  |        X         |          X            |                  |
// CanManageCategories          |        X         |                       |                  |
// CanManageReports             |        X         |                       |         X        |
// CanViewUsers                 |        X         |                       |         X        |
// Creating new Admin accounts is checked separately in AuthService.RegisterAsync (OperationsAdmin
// only) since that route can't declare a policy that also allows anonymous Customer/Vendor calls.
public static class AdminPolicies
{
    public const string CanManageVendorVerification = nameof(CanManageVendorVerification);
    public const string CanManageCategories = nameof(CanManageCategories);
    public const string CanManageReports = nameof(CanManageReports);
    public const string CanViewUsers = nameof(CanViewUsers);

    public const string AdminTitleClaimType = "admin_title";
}
