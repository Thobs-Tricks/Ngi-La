import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from "react-native";
import { Theme } from "../constants/theme";

type PrimaryButtonProps = {
    theme: Theme;
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: "solid" | "outline";
};

export default function PrimaryButton({
    theme,
    label,
    onPress,
    loading = false,
    disabled = false,
    variant = "solid",
}: PrimaryButtonProps) {
    const isDisabled =
        disabled || loading;

    const isOutline =
        variant === "outline";

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.button,
                {
                    backgroundColor: isOutline
                        ? "transparent"
                        : theme.colors.primary,
                    borderColor:
                        theme.colors.primary,
                    borderWidth: isOutline ? 1 : 0,
                    opacity: isDisabled
                        ? 0.5
                        : pressed
                        ? 0.85
                        : 1,
                },
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={
                        isOutline
                            ? theme.colors.primary
                            : theme.colors
                                  .primaryForeground
                    }
                />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: isOutline
                                ? theme.colors.primary
                                : theme.colors
                                      .primaryForeground,
                        },
                    ]}
                >
                    {label}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: "100%",
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        paddingVertical: 14,
    },

    text: {
        fontSize: 15,
        fontWeight: "600",
    },
});