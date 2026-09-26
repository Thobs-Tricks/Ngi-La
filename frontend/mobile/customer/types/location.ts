export type LocationCoordinates = {
    latitude: number;
    longitude: number;
};

export type LocationAddress = {
    suburb: string | null;
    city: string | null;
};

export type StoredLocation = {
    coordinates: LocationCoordinates;
    address: LocationAddress;
    timestamp: number;
};

export type LocationState = {
    location: StoredLocation | null;
    loading: boolean;
    permissionStatus: "granted" | "denied" | "undetermined";
    servicesEnabled: boolean | null;
    error: string | null;
};