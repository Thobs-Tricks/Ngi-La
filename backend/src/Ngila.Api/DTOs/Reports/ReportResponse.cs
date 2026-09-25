namespace Ngila.Api.DTOs.Reports;

public record ReportResponse(
    Guid Id,
    string Kind,
    string Priority,
    string Title,
    string Detail,
    bool IsResolved,
    string Time);
