import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import Logo from "../../components/Logo";
import TextField from "../../components/TextField";
import PrimaryButton from "../../components/PrimaryButton";
import {
    defaultTheme,
    themes,
} from "../../constants/theme";
import useLogin from "../../hooks/useLogin";

export default function LoginScreen() {
    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const theme =
        themes[defaultTheme];

    const {
        login,
        loading,
        error,
        success,
        validationErrors,
    } = useLogin();

    const handleSubmit = async () => {
        const loggedIn = await login({
            email,
            password,
        });

        if (loggedIn) {
            router.replace("/(customer)");
        }
    };

    const handleForgotPassword = () => {
        // Forgot password navigation will be added later.
    };

    const handleRegister = () => {
        router.push("/(auth)/RegisterScreen");
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor:
                        theme.colors.background,
                },
            ]}
            edges={[
                "top",
                "left",
                "right",
                "bottom",
            ]}
        >
            <StatusBar style="dark" />

            <KeyboardAvoidingView
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : undefined
                }
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={
                        styles.scrollContent
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    <View>
                        <View
                            style={
                                styles.header
                            }
                        >
                            <Logo
                                variant="mark"
                                size={52}
                            />

                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color:
                                            theme
                                                .colors
                                                .foreground,
                                    },
                                ]}
                            >
                                Welcome back
                            </Text>

                            <Text
                                style={[
                                    styles.subtitle,
                                    {
                                        color:
                                            theme
                                                .colors
                                                .mutedForeground,
                                    },
                                ]}
                            >
                                Log in to your
                                NGiLA account
                            </Text>
                        </View>

                        {!!error && (
                            <View
                                style={[
                                    styles.errorContainer,
                                    {
                                        backgroundColor:
                                            theme.colors
                                                .destructive +
                                            "15",
                                        borderColor:
                                            theme.colors
                                                .destructive,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.errorText,
                                        {
                                            color:
                                                theme.colors
                                                    .destructive,
                                        },
                                    ]}
                                >
                                    {error}
                                </Text>
                            </View>
                        )}

                        <View
                            style={
                                styles.form
                            }
                        >
                            <TextField
                                theme={theme}
                                label="Email"
                                icon="mail"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholder="you@example.com"
                                value={email}
                                onChangeText={
                                    setEmail
                                }
                                error={
                                    validationErrors
                                        .email
                                }
                            />

                            <View>
                                <TextField
                                    theme={theme}
                                    label="Password"
                                    icon="lock"
                                    isPassword
                                    placeholder="••••••••"
                                    value={
                                        password
                                    }
                                    onChangeText={
                                        setPassword
                                    }
                                    error={
                                        validationErrors
                                            .password
                                    }
                                />

                                <Pressable
                                    onPress={
                                        handleForgotPassword
                                    }
                                    style={
                                        styles.forgotButton
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.forgotText,
                                            {
                                                color:
                                                    theme
                                                        .colors
                                                        .primary,
                                            },
                                        ]}
                                    >
                                        Forgot
                                        password?
                                    </Text>
                                </Pressable>
                            </View>

                            <View
                                style={
                                    styles.buttonContainer
                                }
                            >
                                <PrimaryButton
                                    theme={theme}
                                    label="Log In"
                                    onPress={
                                        handleSubmit
                                    }
                                    loading={
                                        loading
                                    }
                                />
                            </View>
                        </View>
                    </View>

                    <View
                        style={
                            styles.registerRow
                        }
                    >
                        <Text
                            style={[
                                styles.registerPrompt,
                                {
                                    color:
                                        theme
                                            .colors
                                            .mutedForeground,
                                },
                            ]}
                        >
                            Don't have an
                            account?
                        </Text>

                        <Pressable
                            onPress={
                                handleRegister
                            }
                        >
                            <Text
                                style={[
                                    styles.registerText,
                                    {
                                        color:
                                            theme
                                                .colors
                                                .primary,
                                    },
                                ]}
                            >
                                Register
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    keyboardView: {
        flex: 1,
    },

    scrollView: {
        flex: 1,
        paddingHorizontal: 28,
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: "space-between",
        paddingTop: 8,
        paddingBottom: 20,
    },

    header: {
        alignItems: "center",
        paddingTop: 48,
    },

    title: {
        fontSize: 24,
        fontWeight: "600",
        marginTop: 20,
    },

    subtitle: {
        fontSize: 13,
        marginTop: 4,
    },

    errorContainer: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 20,
    },

    errorText: {
        fontSize: 12,
        lineHeight: 18,
    },

    form: {
        marginTop: 40,
        gap: 14,
    },

    forgotButton: {
        alignSelf: "flex-end",
        marginTop: 8,
    },

    forgotText: {
        fontSize: 11,
        fontWeight: "600",
    },

    buttonContainer: {
        marginTop: 4,
    },

    registerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingBottom: 8,
    },

    registerPrompt: {
        fontSize: 13,
    },

    registerText: {
        fontSize: 13,
        fontWeight: "600",
    },
});