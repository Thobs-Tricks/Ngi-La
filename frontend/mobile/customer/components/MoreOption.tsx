import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../constants/theme";

type MoreOptionProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    theme: Theme;
    onPress: () => void;
};

export default function MoreOption({
    title,
    description,
    icon,
    theme,
    onPress,
}: MoreOptionProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    opacity: pressed ? 0.7 : 1,
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
                {icon}
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

                <Text
                    style={[
                        styles.description,
                        {
                            color: theme.colors.mutedForeground,
                        },
                    ]}
                >
                    {description}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 10,
    },

    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    content: {
        flex: 1,
    },

    title: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 3,
    },

    description: {
        fontSize: 12,
        lineHeight: 17,
    },
});