namespace Ngila.Api.DTOs.Admin;

public record AdminStatsResponse(
    int TotalVendors,
    int PendingVerification,
    int ActiveUsers);
