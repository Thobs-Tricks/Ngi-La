namespace Ngila.Api.Configuration;

public class AdminBootstrapSettings
{
    public const string SectionName = "AdminBootstrap";

    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
