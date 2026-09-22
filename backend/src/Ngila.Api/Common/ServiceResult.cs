namespace Ngila.Api.Common;

public class ServiceResult<T>
{
    public bool Succeeded { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }
    public int StatusCode { get; init; } = 200;

    public static ServiceResult<T> Success(T data, int statusCode = 200) =>
        new() { Succeeded = true, Data = data, StatusCode = statusCode };

    public static ServiceResult<T> Failure(string error, int statusCode = 400) =>
        new() { Succeeded = false, Error = error, StatusCode = statusCode };
}
