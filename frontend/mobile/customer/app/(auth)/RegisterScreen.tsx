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
import { Check } from "lucide-react-native";
import Logo from "../../components/Logo";
import TextField from "../../components/TextField";
import GenderSelect from "../../components/GenderSelect";
import Checkbox from "../../components/Checkbox";
import PrimaryButton from "../../components/PrimaryButton";
import {
    defaultTheme,
    themes,
} from "../../constants/theme";
import { Gender } from "../../types/gender";
import useRegister from "../../hooks/useRegister";
import { router } from "expo-router";

export default function RegisterScreen() {
    const theme = themes[defaultTheme];

    const [firstName, setFirstName] =
        useState("");
    const [lastName, setLastName] =
        useState("");
    const [gender, setGender] =
        useState<Gender | null>(null);
    const [phoneNumber, setPhoneNumber] =
        useState("");
    const [email, setEmail] =
        useState("");
    const [password, setPassword] =
        useState("");
    const [acceptedTerms, setAcceptedTerms] =
        useState(false);

    const {
        register,
        loading,
        error,
        success,
        successMessage,
        validationErrors,
    } = useRegister();

    const handleSubmit = async () => {
        await register({
            firstName,
            lastName,
            gender,
            phoneNumber,
            email,
            password,
            acceptedTerms,
        });
    };

    const handleLogin = () => {
        router.push("/(auth)/LoginScreen");
    };

    if (success) {
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

                <View style={styles.successContainer}>
                    <Logo
                        variant="mark"
                        size={44}
                    />

                    <View
                        style={[
                            styles.successIcon,
                            {
                                backgroundColor:
                                    theme.colors
                                        .verified,
                            },
                        ]}
                    >
                        <Check
                            size={30}
                            strokeWidth={3}
                            color={
                                theme.colors
                                    .primaryForeground
                            }
                        />
                    </View>

                    <Text
                        style={[
                            styles.successTitle,
                            {
                                color:
                                    theme.colors
                                        .foreground,
                            },
                        ]}
                    >
                        You're almost in
                    </Text>

                    <Text
                        style={[
                            styles.successMessage,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        {successMessage ||
                            "Your account has been created successfully."}
                    </Text>

                    <View
                        style={
                            styles.successButton
                        }
                    >
                        <PrimaryButton
                            theme={theme}
                            label="Go to Log In"
                            onPress={
                                handleLogin
                            }
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

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
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        <View style={styles.header}>
                            <Logo
                                variant="mark"
                                size={44}
                            />

                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color:
                                            theme.colors
                                                .foreground,
                                    },
                                ]}
                            >
                                Create your account
                            </Text>

                            <Text
                                style={[
                                    styles.subtitle,
                                    {
                                        color:
                                            theme.colors
                                                .mutedForeground,
                                    },
                                ]}
                            >
                                Create your NGiLA account
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

                        <View style={styles.form}>
                            <View
                                style={
                                    styles.nameRow
                                }
                            >
                                <View
                                    style={
                                        styles.nameField
                                    }
                                >
                                    <TextField
                                        theme={theme}
                                        label="First Name"
                                        icon="user"
                                        autoCapitalize="words"
                                        placeholder="Thabo"
                                        value={
                                            firstName
                                        }
                                        onChangeText={
                                            setFirstName
                                        }
                                        error={
                                            validationErrors
                                                .firstName
                                        }
                                    />
                                </View>

                                <View
                                    style={
                                        styles.nameField
                                    }
                                >
                                    <TextField
                                        theme={theme}
                                        label="Last Name"
                                        autoCapitalize="words"
                                        placeholder="Nkosi"
                                        value={
                                            lastName
                                        }
                                        onChangeText={
                                            setLastName
                                        }
                                        error={
                                            validationErrors
                                                .lastName
                                        }
                                    />
                                </View>
                            </View>

                            <GenderSelect
                                theme={theme}
                                value={gender}
                                onChange={setGender}
                            />

                            {!!validationErrors.gender && (
                                <Text
                                    style={[
                                        styles.fieldError,
                                        {
                                            color:
                                                theme
                                                    .colors
                                                    .destructive,
                                        },
                                    ]}
                                >
                                    {
                                        validationErrors.gender
                                    }
                                </Text>
                            )}

                            <TextField
                                theme={theme}
                                label="Phone Number"
                                icon="phone"
                                keyboardType="phone-pad"
                                placeholder="082 000 0000"
                                value={phoneNumber}
                                onChangeText={
                                    setPhoneNumber
                                }
                                error={
                                    validationErrors
                                        .phoneNumber
                                }
                            />

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

                            <TextField
                                theme={theme}
                                label="Password"
                                icon="lock"
                                isPassword
                                placeholder="••••••••"
                                value={password}
                                onChangeText={
                                    setPassword
                                }
                                error={
                                    validationErrors
                                        .password
                                }
                            />

                            <View>
                                <Checkbox
                                    theme={theme}
                                    checked={
                                        acceptedTerms
                                    }
                                    onChange={
                                        setAcceptedTerms
                                    }
                                    label="I agree to the Terms & Conditions"
                                />

                                {!!validationErrors.acceptedTerms && (
                                    <Text
                                        style={[
                                            styles.fieldError,
                                            {
                                                color:
                                                    theme
                                                        .colors
                                                        .destructive,
                                            },
                                        ]}
                                    >
                                        {
                                            validationErrors.acceptedTerms
                                        }
                                    </Text>
                                )}
                            </View>

                            <View
                                style={
                                    styles.buttonContainer
                                }
                            >
                                <PrimaryButton
                                    theme={theme}
                                    label="Register"
                                    onPress={
                                        handleSubmit
                                    }
                                    loading={loading}
                                />
                            </View>
                        </View>
                    </View>

                    <View
                        style={
                            styles.loginRow
                        }
                    >
                        <Text
                            style={[
                                styles.loginPrompt,
                                {
                                    color:
                                        theme.colors
                                            .mutedForeground,
                                },
                            ]}
                        >
                            Already have an
                            account?
                        </Text>

                        <Pressable
                            onPress={handleLogin}
                        >
                            <Text
                                style={[
                                    styles.loginText,
                                    {
                                        color:
                                            theme.colors
                                                .primary,
                                    },
                                ]}
                            >
                                Log In
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
        paddingTop: 32,
    },

    title: {
        fontSize: 24,
        fontWeight: "600",
        marginTop: 16,
    },

    subtitle: {
        fontSize: 14,
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
        marginTop: 32,
        gap: 14,
    },

    nameRow: {
        flexDirection: "row",
        gap: 12,
    },

    nameField: {
        flex: 1,
    },

    fieldError: {
        fontSize: 11,
        marginTop: -8,
    },

    buttonContainer: {
        marginTop: 2,
    },

    loginRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingBottom: 8,
        paddingTop: 24,
    },

    loginPrompt: {
        fontSize: 13,
    },

    loginText: {
        fontSize: 13,
        fontWeight: "600",
    },

    successContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 28,
    },

    successIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 28,
        marginBottom: 20,
    },

    successTitle: {
        fontSize: 24,
        fontWeight: "600",
        textAlign: "center",
    },

    successMessage: {
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center",
        marginTop: 8,
        maxWidth: 320,
    },

    successButton: {
        width: "100%",
        marginTop: 32,
    },
});