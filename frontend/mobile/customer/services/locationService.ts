import * as Location from "expo-location";
import {
    LocationAddress,
    LocationCoordinates,
    StoredLocation,
} from "../types/location";

export async function requestLocationPermission() {
    const { status } =
        await Location.requestForegroundPermissionsAsync();

    return status;
}

export async function checkLocationServices() {
    return await Location.hasServicesEnabledAsync();
}

export async function getCurrentLocation(): Promise<LocationCoordinates> {
    const currentLocation =
        await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

    return {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
    };
}

export async function reverseGeocodeLocation(
    coordinates: LocationCoordinates
): Promise<LocationAddress> {
    const addresses =
        await Location.reverseGeocodeAsync(coordinates);

    if (!addresses.length) {
        return {
            suburb: null,
            city: null,
        };
    }

    return resolveLocationAddress(addresses[0]);
}

export function resolveLocationAddress(
    address: Location.LocationGeocodedAddress
): LocationAddress {
    const suburb =
        address.subregion ??
        address.district ??
        address.street ??
        null;

    const city =
        address.city ??
        address.subregion ??
        address.district ??
        null;

    return {
        suburb,
        city,
    };
}

export async function getUserLocation(): Promise<StoredLocation> {
    const permissionStatus =
        await Location.getForegroundPermissionsAsync();

    if (permissionStatus.status !== "granted") {
        throw new Error(
            "Location permission is required."
        );
    }

    const servicesEnabled =
        await checkLocationServices();

    if (!servicesEnabled) {
        throw new Error(
            "Location services are turned off."
        );
    }

    const coordinates = await getCurrentLocation();

    const address =
        await reverseGeocodeLocation(coordinates);

    return {
        coordinates,
        address,
        timestamp: Date.now(),
    };
}