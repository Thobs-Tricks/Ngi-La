import { Pressable, StyleSheet, Text } from "react-native";
import { Theme } from "../constants/theme";

type CategoryPillProps = {
    label: string;
    selected: boolean;
    theme: Theme;
    onPress: () => void;
};

export default function CategoryPill({
    label,
    selected,
    theme,
    onPress,
}: CategoryPillProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor: selected
                        ? theme.colors.primary
                        : theme.colors.secondary,
                    borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                },
            ]}
        >
            <Text
                style={[
                    styles.label,
                    {
                        color: selected
                            ? theme.colors.primaryForeground
                            : theme.colors.secondaryForeground,
                    },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 999,
        marginRight: 8,
    },

    label: {
        fontSize: 13,
        fontWeight: "500",
    },
});