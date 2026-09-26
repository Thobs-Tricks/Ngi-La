import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    checkLocationServices,
    getUserLocation,
    requestLocationPermission,
} from "../services/locationService";
import {
    getStoredLocation,
    saveLocation,
} from "../storage/locationStorage";
import {
    StoredLocation,
} from "../types/location";

export default function useLocation() {
    const [location, setLocation] =
        useState<StoredLocation | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [permissionStatus, setPermissionStatus] =
        useState<
            "granted" |
            "denied" |
            "undetermined"
        >("undetermined");

    const [servicesEnabled, setServicesEnabled] =
        useState<boolean | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const initializeLocation = useCallback(
        async () => {
            try {
                setLoading(true);
                setError(null);

                const storedLocation =
                    await getStoredLocation();

                if (storedLocation) {
                    setLocation(storedLocation);
                }

                const permission =
                    await requestLocationPermission();

                setPermissionStatus(
                    permission === "granted"
                        ? "granted"
                        : "denied"
                );

                if (permission !== "granted") {
                    setError(
                        "Location permission is required."
                    );
                    return;
                }

                const services =
                    await checkLocationServices();

                setServicesEnabled(services);

                if (!services) {
                    setError(
                        "Location services are turned off."
                    );
                    return;
                }

                const currentLocation =
                    await getUserLocation();

                await saveLocation(
                    currentLocation
                );

                setLocation(
                    currentLocation
                );
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to get your location."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        initializeLocation();
    }, [initializeLocation]);

    const retryLocation =
        useCallback(async () => {
            await initializeLocation();
        }, [initializeLocation]);

    return {
        location,
        loading,
        permissionStatus,
        servicesEnabled,
        error,
        initializeLocation,
        retryLocation,
    };
}