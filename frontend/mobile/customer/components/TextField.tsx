import React from "react";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Phone,
    UserRound,
} from "lucide-react-native";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { Theme } from "../constants/theme";

type TextFieldIcon =
    | "mail"
    | "lock"
    | "user"
    | "phone";

type TextFieldProps = TextInputProps & {
    theme: Theme;
    label: string;
    error?: string;
    isPassword?: boolean;
    icon?: TextFieldIcon;
};

export default function TextField({
    theme,
    label,
    error,
    isPassword = false,
    icon,
    ...rest
}: TextFieldProps) {
    const [hidden, setHidden] =
        React.useState(isPassword);

    const renderIcon = () => {
        if (icon === "mail") {
            return (
                <Mail
                    size={16}
                    strokeWidth={2}
                    color={
                        theme.colors.mutedForeground
                    }
                />
            );
        }

        if (icon === "lock") {
            return (
                <LockKeyhole
                    size={16}
                    strokeWidth={2}
                    color={
                        theme.colors.mutedForeground
                    }
                />
            );
        }

        if (icon === "user") {
            return (
                <UserRound
                    size={16}
                    strokeWidth={2}
                    color={
                        theme.colors.mutedForeground
                    }
                />
            );
        }

        if (icon === "phone") {
            return (
                <Phone
                    size={16}
                    strokeWidth={2}
                    color={
                        theme.colors.mutedForeground
                    }
                />
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.label,
                    {
                        color:
                            theme.colors
                                .mutedForeground,
                    },
                ]}
            >
                {label}
            </Text>

            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor:
                            theme.colors.card,
                        borderColor: error
                            ? theme.colors.destructive
                            : theme.colors.border,
                    },
                ]}
            >
                {icon && (
                    <View style={styles.icon}>
                        {renderIcon()}
                    </View>
                )}

                <TextInput
                    {...rest}
                    style={[
                        styles.input,
                        {
                            color:
                                theme.colors.foreground,
                        },
                    ]}
                    placeholderTextColor={
                        theme.colors.mutedForeground
                    }
                    secureTextEntry={hidden}
                />

                {isPassword && (
                    <Pressable
                        onPress={() =>
                            setHidden(
                                (current) => !current
                            )
                        }
                        style={styles.passwordButton}
                        hitSlop={8}
                    >
                        {hidden ? (
                            <Eye
                                size={16}
                                strokeWidth={2}
                                color={
                                    theme.colors
                                        .mutedForeground
                                }
                            />
                        ) : (
                            <EyeOff
                                size={16}
                                strokeWidth={2}
                                color={
                                    theme.colors
                                        .mutedForeground
                                }
                            />
                        )}
                    </Pressable>
                )}
            </View>

            {!!error && (
                <Text
                    style={[
                        styles.error,
                        {
                            color:
                                theme.colors
                                    .destructive,
                        },
                    ]}
                >
                    {error}
                </Text>
            )}
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
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 6,
    },

    inputContainer: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        gap: 10,
    },

    icon: {
        alignItems: "center",
        justifyContent: "center",
    },

    input: {
        flex: 1,
        minHeight: 46,
        paddingVertical: 12,
        fontSize: 15,
    },

    passwordButton: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },

    error: {
        fontSize: 11,
        marginTop: 4,
    },
});