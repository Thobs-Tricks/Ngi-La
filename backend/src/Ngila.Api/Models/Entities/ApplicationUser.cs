using Microsoft.AspNetCore.Identity;
using Ngila.Api.Models.Enums;

namespace Ngila.Api.Models.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public Gender? Gender { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public VendorProfile? VendorProfile { get; set; }
    public CustomerProfile? CustomerProfile { get; set; }
}
