import {
    Check,
} from "lucide-react-native";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../constants/theme";

type CheckboxProps = {
    theme: Theme;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
};

export default function Checkbox({
    theme,
    checked,
    onChange,
    label,
}: CheckboxProps) {
    return (
        <Pressable
            onPress={() => onChange(!checked)}
            style={({ pressed }) => [
                styles.container,
                {
                    opacity: pressed ? 0.85 : 1,
                },
            ]}
        >
            <View
                style={[
                    styles.checkbox,
                    {
                        backgroundColor: checked
                            ? theme.colors.primary
                            : theme.colors.card,
                        borderColor: checked
                            ? theme.colors.primary
                            : theme.colors.border,
                    },
                ]}
            >
                {checked && (
                    <Check
                        size={13}
                        strokeWidth={3}
                        color={
                            theme.colors
                                .primaryForeground
                        }
                    />
                )}
            </View>

            <Text
                style={[
                    styles.label,
                    {
                        color:
                            theme.colors.foreground,
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
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: 6,
        marginTop: 2,
    },
    label: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
});