namespace Ngila.Api.DTOs.Admin;

public record AdminStatsResponse(
    int TotalVendors,
    int CommunityAdded,
    int PendingVerification,
    int ActiveUsers,
    int ReportsOpen);
