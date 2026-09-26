namespace Ngila.Api.DTOs.Vendors;

// Day is the full English name ("Monday".."Sunday"), matching what the vendor app's day-picker
// UI already uses - no numeric DayOfWeek mapping for clients to get wrong. OpenTime/CloseTime are
// "HH:mm" strings, required only when IsOpen is true.
public record TradingHourRequest(string Day, bool IsOpen, string? OpenTime, string? CloseTime);
