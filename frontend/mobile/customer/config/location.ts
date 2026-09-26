import * as Location from "expo-location";

export const LOCATION_CONFIG = {
    accuracy: Location.Accuracy.Balanced,
    timeout: 15000,
    maximumAge: 300000,
};