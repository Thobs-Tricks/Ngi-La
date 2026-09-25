namespace Ngila.Api.Models.Entities;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;

    public ICollection<VendorProfile> VendorProfiles { get; set; } = new List<VendorProfile>();
}
