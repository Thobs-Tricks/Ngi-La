namespace Ngila.Api.DTOs.Vendors;

public record TradingHourResponse(string Day, bool IsOpen, string? OpenTime, string? CloseTime);
