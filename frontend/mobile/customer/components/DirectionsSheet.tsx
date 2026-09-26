import { useState } from "react";
import {
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Navigation, X } from "lucide-react-native";
import { Theme } from "../constants/theme";
import { Vendor } from "../constants/vendor";
import VendorMap, { RouteInfo } from "./VendorMap";

type DirectionsSheetProps = {
    vendor: Vendor | null;
    userLocation: { latitude: number; longitude: number } | null;
    visible: boolean;
    theme: Theme;
    onClose: () => void;
};

export default function DirectionsSheet({
    vendor,
    userLocation,
    visible,
    theme,
    onClose,
}: DirectionsSheetProps) {
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

    if (!vendor) {
        return null;
    }

    const openInMapsApp = () => {
        const destination = `${vendor.latitude},${vendor.longitude}`;
        const url = userLocation
            ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination}`
            : `https://www.google.com/maps/search/?api=1&query=${destination}`;
        Linking.openURL(url);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                style={[
                    styles.overlay,
                    { backgroundColor: theme.colors.overlay },
                ]}
            >
                <Pressable style={styles.dismissArea} onPress={onClose} />

                <View
                    style={[
                        styles.sheet,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    <View style={styles.handle} />

                    <View style={styles.topRow}>
                        <View style={styles.titleGroup}>
                            <Text
                                style={[
                                    styles.kicker,
                                    { color: theme.colors.mutedForeground },
                                ]}
                            >
                                Directions to
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[styles.title, { color: theme.colors.foreground }]}
                            >
                                {vendor.name}
                            </Text>
                        </View>

                        <Pressable
                            onPress={onClose}
                            style={[
                                styles.closeButton,
                                { backgroundColor: theme.colors.secondary },
                            ]}
                        >
                            <X size={17} strokeWidth={2.2} color={theme.colors.foreground} />
                        </Pressable>
                    </View>

                    <View style={styles.mapContainer}>
                        <VendorMap
                            theme={theme}
                            vendors={[vendor]}
                            userLocation={userLocation}
                            routeTo={vendor}
                            onRouteInfo={setRouteInfo}
                        />
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.routeInfoRow}>
                            {routeInfo ? (
                                <>
                                    <Text
                                        style={[
                                            styles.routeDistance,
                                            { color: theme.colors.foreground },
                                        ]}
                                    >
                                        {routeInfo.distanceText}
                                        {!routeInfo.isEstimate ? ` · ${routeInfo.durationText}` : ""}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.routeSubtext,
                                            { color: theme.colors.mutedForeground },
                                        ]}
                                    >
                                        {routeInfo.isEstimate
                                            ? "Straight-line distance (driving route unavailable)"
                                            : "Estimated driving distance"}
                                    </Text>
                                </>
                            ) : (
                                <Text
                                    style={[
                                        styles.routeSubtext,
                                        { color: theme.colors.mutedForeground },
                                    ]}
                                >
                                    {userLocation
                                        ? "Calculating route…"
                                        : "Enable location access to see distance and route."}
                                </Text>
                            )}
                        </View>

                        <Pressable
                            onPress={openInMapsApp}
                            style={[
                                styles.primaryButton,
                                { backgroundColor: theme.colors.primary },
                            ]}
                        >
                            <Navigation
                                size={15}
                                strokeWidth={2.2}
                                color={theme.colors.primaryForeground}
                            />
                            <Text
                                style={[
                                    styles.primaryButtonText,
                                    { color: theme.colors.primaryForeground },
                                ]}
                            >
                                Open in Maps app
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },

    dismissArea: {
        flex: 1,
    },

    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        paddingBottom: 28,
        height: "85%",
    },

    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#D4D4D8",
        alignSelf: "center",
        marginBottom: 14,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginBottom: 12,
    },

    titleGroup: {
        flex: 1,
        marginRight: 12,
    },

    kicker: {
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 2,
    },

    title: {
        fontSize: 19,
        fontWeight: "700",
    },

    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },

    mapContainer: {
        flex: 1,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: "hidden",
    },

    footer: {
        paddingHorizontal: 16,
        paddingTop: 14,
    },

    routeInfoRow: {
        marginBottom: 12,
    },

    routeDistance: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 2,
    },

    routeSubtext: {
        fontSize: 12,
    },

    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 48,
        borderRadius: 10,
    },

    primaryButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
