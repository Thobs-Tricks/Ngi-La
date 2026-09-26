import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import AppStatusBar from "../../components/AppStatusBar";
import AuthHeader from "../../components/AuthHeader";
import AuthSwitchTabs from "../../components/AuthSwitchTabs";
import TextField from "../../components/TextField";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../hooks/useAuth";
import type { AuthStackParamList } from "../../router/types";

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login, isSubmitting, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      await login({ email, password });
    } catch {
      // error is surfaced via context
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <AppStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Welcome back"
            subtitle="Log in to keep your spaza running smoothly"
          />
          <AuthSwitchTabs
            active="login"
            onSelect={(tab) =>
              tab === "register" && navigation.replace("Register")
            }
          />

          <View className="mt-7 gap-3.5 px-7">
            <TextField
              label="Email"
              icon="mail"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                clearError();
              }}
            />
            <View>
              <TextField
                label="Password"
                icon="lock"
                isPassword
                placeholder="••••••••"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  clearError();
                }}
              />
              <Text
                onPress={() => navigation.navigate("ForgotPassword")}
                suppressHighlighting
                className="mt-2 self-end text-xs font-semibold text-primary"
              >
                Forgot password?
              </Text>
            </View>

            {!!error && (
              <Text className="text-sm text-destructive">{error}</Text>
            )}

            <View className="mt-1">
              <PrimaryButton
                label="Log In"
                onPress={handleSubmit}
                loading={isSubmitting}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
