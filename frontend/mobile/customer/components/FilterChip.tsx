import { Pressable, StyleSheet, Text } from "react-native";
import { Theme } from "../constants/theme";

type FilterChipProps = {
    label: string;
    selected: boolean;
    theme: Theme;
    onPress: () => void;
};

export default function FilterChip({
    label,
    selected,
    theme,
    onPress,
}: FilterChipProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor: selected
                        ? theme.colors.primary
                        : theme.colors.background,
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
                            : theme.colors.foreground,
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
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderRadius: 999,
        marginRight: 8,
    },

    label: {
        fontSize: 13,
        fontWeight: "500",
    },
});