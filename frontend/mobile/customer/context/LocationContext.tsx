import {
    createContext,
    ReactNode,
    useContext,
} from "react";
import useLocation from "../hooks/useLocation";

type LocationContextValue =
    ReturnType<typeof useLocation>;

const LocationContext =
    createContext<LocationContextValue | null>(
        null
    );

type LocationProviderProps = {
    children: ReactNode;
};

export function LocationProvider({
    children,
}: LocationProviderProps) {
    const location = useLocation();

    return (
        <LocationContext.Provider value={location}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocationContext() {
    const context =
        useContext(LocationContext);

    if (!context) {
        throw new Error(
            "useLocationContext must be used within a LocationProvider."
        );
    }

    return context;
}