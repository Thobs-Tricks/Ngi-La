import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../constants/theme";
import { Gender } from "../types/gender";

const OPTIONS: {
    label: string;
    value: Gender;
}[] = [
    {
        label: "Female",
        value: "Female",
    },
    {
        label: "Male",
        value: "Male",
    },
    {
        label: "Other",
        value: "Other",
    },
];

type GenderSelectProps = {
    theme: Theme;
    value: Gender | null;
    onChange: (value: Gender) => void;
};

export default function GenderSelect({
    theme,
    value,
    onChange,
}: GenderSelectProps) {
    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.label,
                    {
                        color: theme.colors.foreground,
                    },
                ]}
            >
                Gender
            </Text>

            <View style={styles.options}>
                {OPTIONS.map((option) => {
                    const active =
                        value === option.value;

                    return (
                        <Pressable
                            key={option.value}
                            onPress={() =>
                                onChange(option.value)
                            }
                            style={({ pressed }) => [
                                styles.option,
                                {
                                    backgroundColor: active
                                        ? theme.colors.primary
                                        : theme.colors.card,
                                    borderColor: active
                                        ? theme.colors.primary
                                        : theme.colors.border,
                                    opacity: pressed
                                        ? 0.85
                                        : 1,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    {
                                        color: active
                                            ? theme.colors
                                                  .primaryForeground
                                            : theme.colors
                                                  .foreground,
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    label: {
        fontSize: 11,
        fontWeight: "500",
        marginBottom: 6,
    },
    options: {
        flexDirection: "row",
        gap: 8,
    },
    option: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
    },
    optionText: {
        fontSize: 14,
        fontWeight: "500",
    },
});