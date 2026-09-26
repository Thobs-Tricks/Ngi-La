import {
    Bell,
    MapPin,
    Moon,
    Sun,
} from "lucide-react-native";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../constants/theme";
import { useLocationContext } from "../context/LocationContext";

type AppHeaderProps = {
    theme: Theme;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onNotifications: () => void;
};

export default function AppHeader({
    theme,
    isDarkMode,
    onToggleDarkMode,
    onNotifications,
}: AppHeaderProps) {
    const {
        location,
        loading,
    } = useLocationContext();

    const locationText = loading
        ? "Locating..."
        : location?.address.suburb &&
          location?.address.city
        ? `${location.address.suburb}, ${location.address.city}`
        : location?.address.city
        ? location.address.city
        : "Location unavailable";

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.background,
                    borderBottomColor: theme.colors.border,
                },
            ]}
        >
            <View style={styles.brandSection}>
                <View
                    style={[
                        styles.logoContainer,
                        {
                            backgroundColor:
                                theme.colors.primary,
                        },
                    ]}
                >
                    <MapPin
                        size={17}
                        strokeWidth={2.5}
                        color={
                            theme.colors.primaryForeground
                        }
                    />
                </View>

                <View style={styles.brandText}>
                    <Text
                        style={[
                            styles.logoText,
                            {
                                color:
                                    theme.colors.foreground,
                            },
                        ]}
                    >
                        Ngila
                    </Text>

                    <View style={styles.locationRow}>
                        <MapPin
                            size={10}
                            strokeWidth={2}
                            color={
                                theme.colors
                                    .mutedForeground
                            }
                            style={styles.locationIcon}
                        />

                        <Text
                            style={[
                                styles.locationText,
                                {
                                    color:
                                        theme.colors
                                            .mutedForeground,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {locationText}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <Pressable
                    onPress={onToggleDarkMode}
                    style={({ pressed }) => [
                        styles.actionButton,
                        {
                            backgroundColor:
                                theme.colors.secondary,
                            opacity: pressed ? 0.7 : 1,
                        },
                    ]}
                >
                    {isDarkMode ? (
                        <Sun
                            size={17}
                            strokeWidth={2}
                            color={
                                theme.colors.foreground
                            }
                        />
                    ) : (
                        <Moon
                            size={17}
                            strokeWidth={2}
                            color={
                                theme.colors.foreground
                            }
                        />
                    )}
                </Pressable>

                <Pressable
                    onPress={onNotifications}
                    style={({ pressed }) => [
                        styles.actionButton,
                        {
                            backgroundColor:
                                theme.colors.secondary,
                            opacity: pressed ? 0.7 : 1,
                        },
                    ]}
                >
                    <Bell
                        size={17}
                        strokeWidth={2}
                        color={
                            theme.colors.foreground
                        }
                    />

                    <View
                        style={[
                            styles.notificationDot,
                            {
                                backgroundColor:
                                    theme.colors.destructive,
                                borderColor:
                                    theme.colors.background,
                            },
                        ]}
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },

    brandSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    logoContainer: {
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 9,
    },

    brandText: {
        justifyContent: "center",
        flex: 1,
    },

    logoText: {
        fontSize: 18,
        fontWeight: "800",
        lineHeight: 20,
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 1,
        paddingRight: 8,
    },

    locationIcon: {
        marginRight: 3,
    },

    locationText: {
        fontSize: 9,
        fontWeight: "500",
        flexShrink: 1,
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },

    notificationDot: {
        position: "absolute",
        width: 7,
        height: 7,
        borderRadius: 4,
        top: 7,
        right: 7,
        borderWidth: 1.5,
    },
});