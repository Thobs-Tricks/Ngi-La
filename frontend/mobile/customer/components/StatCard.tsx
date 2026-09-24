import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../constants/theme";

type StatCardProps = {
    value: string;
    label: string;
    theme: Theme;
};

export default function StatCard({
    value,
    label,
    theme,
}: StatCardProps) {
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
            <Text
                style={[
                    styles.value,
                    {
                        color: theme.colors.foreground,
                    },
                ]}
            >
                {value}
            </Text>

            <Text
                style={[
                    styles.label,
                    {
                        color: theme.colors.mutedForeground,
                    },
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    value: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 3,
    },

    label: {
        fontSize: 11,
        fontWeight: "500",
        textAlign: "center",
    },
});