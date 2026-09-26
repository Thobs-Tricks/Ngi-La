import {
    MapPin,
    X,
} from "lucide-react-native";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../constants/theme";

type LocationPermissionModalProps = {
    theme: Theme;
    visible: boolean;
    onAllowLocation: () => void;
    onClose?: () => void;
};

export default function LocationPermissionModal({
    theme,
    visible,
    onAllowLocation,
    onClose,
}: LocationPermissionModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
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
                    {onClose && (
                        <Pressable
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={8}
                        >
                            <X
                                size={19}
                                strokeWidth={2}
                                color={
                                    theme.colors
                                        .mutedForeground
                                }
                            />
                        </Pressable>
                    )}

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
                        Allow Location Access
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
                        Ngila uses your location to show
                        you nearby vendors, local
                        discoveries, and relevant
                        community updates.
                    </Text>

                    <Pressable
                        onPress={onAllowLocation}
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
                        <MapPin
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
                            Allow Location
                        </Text>
                    </Pressable>

                    <Text
                        style={[
                            styles.permissionNote,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        You can manage location
                        permissions in your device
                        settings at any time.
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
        position: "relative",
    },

    closeButton: {
        position: "absolute",
        top: 14,
        right: 14,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
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

    permissionNote: {
        fontSize: 10,
        lineHeight: 15,
        textAlign: "center",
        marginTop: 13,
    },
});