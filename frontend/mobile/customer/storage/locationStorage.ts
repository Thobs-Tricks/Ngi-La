import AsyncStorage from "@react-native-async-storage/async-storage";
import { StoredLocation } from "../types/location";

export const LOCATION_STORAGE_KEY =
    "@ngila_user_location";

export async function saveLocation(
    location: StoredLocation
): Promise<void> {
    await AsyncStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(location)
    );
}

export async function getStoredLocation(): Promise<StoredLocation | null> {
    const storedLocation =
        await AsyncStorage.getItem(
            LOCATION_STORAGE_KEY
        );

    if (!storedLocation) {
        return null;
    }

    try {
        return JSON.parse(
            storedLocation
        ) as StoredLocation;
    } catch {
        await clearStoredLocation();
        return null;
    }
}

export async function clearStoredLocation(): Promise<void> {
    await AsyncStorage.removeItem(
        LOCATION_STORAGE_KEY
    );
}