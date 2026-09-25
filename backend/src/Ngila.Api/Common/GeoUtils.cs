namespace Ngila.Api.Common;

public static class GeoUtils
{
    private const double EarthRadiusMeters = 6_371_000;

    // Default reference point (Johannesburg CBD) used when a caller doesn't supply their own
    // location, so "distance" always resolves to a real number rather than requiring every
    // client to pass coordinates just to browse.
    public const decimal DefaultLatitude = -26.2041m;
    public const decimal DefaultLongitude = 28.0473m;

    public static double DistanceMeters(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
    {
        var phi1 = ToRadians((double)lat1);
        var phi2 = ToRadians((double)lat2);
        var deltaPhi = ToRadians((double)(lat2 - lat1));
        var deltaLambda = ToRadians((double)(lon2 - lon1));

        var a = Math.Sin(deltaPhi / 2) * Math.Sin(deltaPhi / 2) +
                Math.Cos(phi1) * Math.Cos(phi2) *
                Math.Sin(deltaLambda / 2) * Math.Sin(deltaLambda / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusMeters * c;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
}
