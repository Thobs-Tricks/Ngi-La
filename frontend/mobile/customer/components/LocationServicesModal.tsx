import {
    MapPin,
    RefreshCw,
    Settings,
} from "lucide-react-native";
import {
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../constants/theme";

type LocationServicesModalProps = {
    theme: Theme;
    visible: boolean;
    onRetry: () => void;
};

export default function LocationServicesModal({
    theme,
    visible,
    onRetry,
}: LocationServicesModalProps) {
    const openLocationSettings = async () => {
        await Linking.openSettings();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor:
                                theme.colors.card,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor:
                                    theme.colors
                                        .secondary,
                            },
                        ]}
                    >
                        <MapPin
                            size={25}
                            strokeWidth={2}
                            color={
                                theme.colors.primary
                            }
                        />
                    </View>

                    <Text
                        style={[
                            styles.title,
                            {
                                color:
                                    theme.colors
                                        .foreground,
                            },
                        ]}
                    >
                        Turn On Location
                    </Text>

                    <Text
                        style={[
                            styles.description,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        Your device location is currently
                        turned off. Turn on location
                        services so Ngila can find nearby
                        vendors and local discoveries.
                    </Text>

                    <Pressable
                        onPress={openLocationSettings}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            {
                                backgroundColor:
                                    theme.colors.primary,
                                opacity: pressed
                                    ? 0.8
                                    : 1,
                            },
                        ]}
                    >
                        <Settings
                            size={17}
                            strokeWidth={2}
                            color={
                                theme.colors
                                    .primaryForeground
                            }
                        />

                        <Text
                            style={[
                                styles.primaryButtonText,
                                {
                                    color:
                                        theme.colors
                                            .primaryForeground,
                                },
                            ]}
                        >
                            Turn On Location
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={onRetry}
                        style={({ pressed }) => [
                            styles.retryButton,
                            {
                                borderColor:
                                    theme.colors.border,
                                opacity: pressed
                                    ? 0.7
                                    : 1,
                            },
                        ]}
                    >
                        <RefreshCw
                            size={16}
                            strokeWidth={2}
                            color={
                                theme.colors.foreground
                            }
                        />

                        <Text
                            style={[
                                styles.retryButtonText,
                                {
                                    color:
                                        theme.colors
                                            .foreground,
                                },
                            ]}
                        >
                            I've Turned It On
                        </Text>
                    </Pressable>

                    <Text
                        style={[
                            styles.note,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        Return to Ngila after enabling
                        location, then tap the button
                        above to continue.
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },

    container: {
        width: "100%",
        maxWidth: 380,
        borderRadius: 18,
        padding: 24,
        alignItems: "center",
    },

    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    title: {
        fontSize: 20,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 9,
    },

    description: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
        marginBottom: 22,
    },

    primaryButton: {
        width: "100%",
        minHeight: 44,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },

    primaryButtonText: {
        fontSize: 13,
        fontWeight: "700",
    },

    retryButton: {
        width: "100%",
        minHeight: 44,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 10,
    },

    retryButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },

    note: {
        fontSize: 10,
        lineHeight: 15,
        textAlign: "center",
        marginTop: 13,
    },
});