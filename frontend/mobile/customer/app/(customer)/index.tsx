import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import HomeScreen from "./HomeScreen";
import DiscoverScreen from "./DiscoverScreen";
import FeedScreen from "./FeedScreen";
import MoreScreen from "./MoreScreen";
import AppHeader from "../../components/AppHeader";
import BottomNavigation, {
    CustomerTab,
} from "../../components/BottomNavigation";
import VendorDetailSheet from "../../components/VendorDetailSheet";
import DirectionsSheet from "../../components/DirectionsSheet";
import Toast from "../../components/Toast";
import {
    defaultTheme,
    ThemeMode,
    themes,
} from "../../constants/theme";
import { vendors } from "../../constants/vendor";

export default function CustomerHome() {
    const [activeTab, setActiveTab] =
        useState<CustomerTab>("home");

    const [themeMode, setThemeMode] =
        useState<ThemeMode>(defaultTheme);

    const [selectedVendorId, setSelectedVendorId] =
        useState<number | null>(null);

    const [directionsVendorId, setDirectionsVendorId] =
        useState<number | null>(null);

    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [toastVisible, setToastVisible] =
        useState(false);

    const [toastTitle, setToastTitle] =
        useState("");

    const [toastDescription, setToastDescription] =
        useState("");

    const theme = themes[themeMode];

    const selectedVendor =
        vendors.find(
            (vendor) => vendor.id === selectedVendorId
        ) ?? null;

    const directionsVendor =
        vendors.find(
            (vendor) => vendor.id === directionsVendorId
        ) ?? null;

    useEffect(() => {
        if (!toastVisible) {
            return;
        }

        const timeout = setTimeout(() => {
            setToastVisible(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [toastVisible]);

    const showToast = (
        title: string,
        description?: string
    ) => {
        setToastTitle(title);
        setToastDescription(description ?? "");
        setToastVisible(true);
    };

    const handleVendorPress = (vendorId: number) => {
        setSelectedVendorId(vendorId);
    };

    const handleCloseVendorSheet = () => {
        setSelectedVendorId(null);
    };

    const handleToggleDarkMode = () => {
        setThemeMode((currentMode) =>
            currentMode === "light" ? "dark" : "light"
        );
    };

    const handleNotifications = () => {
        showToast(
            "Notifications",
            "Your notifications will appear here."
        );
    };

    const handleAddVendor = () => {
        showToast(
            "Add Vendor",
            "Vendor creation will be available here."
        );
    };

    const handleVendorTools = () => {
        showToast(
            "Vendor Tools",
            "Vendor tools will be available here."
        );
    };

    const handleHowNgilaWorks = () => {
        showToast(
            "How Ngila Works",
            "Learn how Ngila connects communities with local vendors."
        );
    };

    const handleAboutNgila = () => {
        showToast(
            "About Ngila",
            "Ngila helps communities discover and support local businesses."
        );
    };

    const handleDirections = async () => {
        if (!selectedVendor) {
            return;
        }

        const vendorId = selectedVendor.id;
        setSelectedVendorId(null);
        setDirectionsVendorId(vendorId);

        if (userLocation) {
            return;
        }

        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                showToast(
                    "Location needed",
                    "Enable location access to see distance and route."
                );
                return;
            }
            const position = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        } catch {
            showToast(
                "Couldn't get your location",
                "You can still open this vendor in your maps app."
            );
        }
    };

    const handleCloseDirections = () => {
        setDirectionsVendorId(null);
    };

    const handleRateVendor = () => {
        if (!selectedVendor) {
            return;
        }

        showToast(
            "Rate Vendor",
            `Rating ${selectedVendor.name} will be available here.`
        );
    };

    const renderActiveScreen = () => {
        switch (activeTab) {
            case "discover":
                return (
                    <DiscoverScreen
                        theme={theme}
                        onVendorPress={handleVendorPress}
                    />
                );

            case "feed":
                return (
                    <FeedScreen
                        theme={theme}
                        onAddVendor={handleAddVendor}
                    />
                );

            case "more":
                return (
                    <MoreScreen
                        theme={theme}
                        isDarkMode={themeMode === "dark"}
                        onToggleDarkMode={handleToggleDarkMode}
                        onVendorTools={handleVendorTools}
                        onHowNgilaWorks={handleHowNgilaWorks}
                        onAboutNgila={handleAboutNgila}
                    />
                );

            case "home":
            default:
                return (
                    <HomeScreen
                        theme={theme}
                        onVendorPress={handleVendorPress}
                    />
                );
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.background,
                },
            ]}
        >
            <StatusBar
                style={
                    themeMode === "dark"
                        ? "light"
                        : "dark"
                }
            />

            <AppHeader
                theme={theme}
                isDarkMode={themeMode === "dark"}
                onToggleDarkMode={handleToggleDarkMode}
                onNotifications={handleNotifications}
            />

            <View style={styles.screen}>
                {renderActiveScreen()}
            </View>

            <BottomNavigation
                activeTab={activeTab}
                theme={theme}
                onTabPress={setActiveTab}
            />

            <VendorDetailSheet
                vendor={selectedVendor}
                visible={selectedVendor !== null}
                theme={theme}
                onClose={handleCloseVendorSheet}
                onDirections={handleDirections}
                onRate={handleRateVendor}
            />

            <DirectionsSheet
                vendor={directionsVendor}
                userLocation={userLocation}
                visible={directionsVendor !== null}
                theme={theme}
                onClose={handleCloseDirections}
            />

            <Toast
                visible={toastVisible}
                title={toastTitle}
                description={toastDescription}
                theme={theme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    screen: {
        flex: 1,
    },
});