import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../constants/theme";

type ToastProps = {
    visible: boolean;
    title: string;
    description?: string;
    theme: Theme;
};

export default function Toast({
    visible,
    title,
    description,
    theme,
}: ToastProps) {
    if (!visible) {
        return null;
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <View
                style={[
                    styles.iconContainer,
                    {
                        backgroundColor: theme.colors.secondary,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.icon,
                        {
                            color: theme.colors.foreground,
                        },
                    ]}
                >
                    i
                </Text>
            </View>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: theme.colors.foreground,
                        },
                    ]}
                >
                    {title}
                </Text>

                {description && (
                    <Text
                        style={[
                            styles.description,
                            {
                                color:
                                    theme.colors.mutedForeground,
                            },
                        ]}
                    >
                        {description}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 88,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
    },

    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },

    icon: {
        fontSize: 14,
        fontWeight: "700",
    },

    content: {
        flex: 1,
    },

    title: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 2,
    },

    description: {
        fontSize: 11,
        lineHeight: 16,
    },
});