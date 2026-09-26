import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./HomeScreen";
import DiscoverScreen from "./DiscoverScreen";
import FeedScreen from "./FeedScreen";
import MoreScreen from "./MoreScreen";
import AppHeader from "../../components/AppHeader";
import BottomNavigation, {
    CustomerTab,
} from "../../components/BottomNavigation";
import VendorDetailSheet from "../../components/VendorDetailSheet";
import Toast from "../../components/Toast";
import LocationPermissionModal from "../../components/LocationPermissionModal";
import LocationServicesModal from "../../components/LocationServicesModal";
import {
    defaultTheme,
    ThemeMode,
    themes,
} from "../../constants/theme";
import { vendors } from "../../constants/vendor";
import { useLocationContext } from "../../context/LocationContext";
import { router } from "expo-router";

export default function CustomerHome() {
    const [activeTab, setActiveTab] =
        useState<CustomerTab>("home");

    const [themeMode, setThemeMode] =
        useState<ThemeMode>(defaultTheme);

    const [selectedVendorId, setSelectedVendorId] =
        useState<number | null>(null);

    const [toastVisible, setToastVisible] =
        useState(false);

    const [toastTitle, setToastTitle] =
        useState("");

    const [toastDescription, setToastDescription] =
        useState("");

    const theme = themes[themeMode];

    const {
        permissionStatus,
        servicesEnabled,
        retryLocation,
    } = useLocationContext();

    const selectedVendor =
        vendors.find(
            (vendor) => vendor.id === selectedVendorId
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

    const handleDirections = () => {
        if (!selectedVendor) {
            return;
        }

        showToast(
            "Directions",
            `Directions to ${selectedVendor.name} will open here.`
        );
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

const handleAddPost = () => {
    router.push("/(auth)/LoginScreen");
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
                        onAddPost={handleAddPost}
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
                            onExploreVendors={() =>
                                setActiveTab("discover")
                            }
                        />
                    );
        }
    };

    const permissionModalVisible =
        permissionStatus !== "granted";

    const servicesModalVisible =
        permissionStatus === "granted" &&
        servicesEnabled === false;

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

            <Toast
                visible={toastVisible}
                title={toastTitle}
                description={toastDescription}
                theme={theme}
            />

            <LocationPermissionModal
                theme={theme}
                visible={permissionModalVisible}
                onAllowLocation={retryLocation}
            />

            <LocationServicesModal
                theme={theme}
                visible={servicesModalVisible}
                onRetry={retryLocation}
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