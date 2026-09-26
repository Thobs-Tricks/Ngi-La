import { Stack } from "expo-router";
import { AuthProvider } from "../../context/AuthContext";
import { LocationProvider } from "../../context/LocationContext";

export default function CustomerLayout() {
    return (
        <AuthProvider>
            <LocationProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                />
            </LocationProvider>
        </AuthProvider>
    );
}