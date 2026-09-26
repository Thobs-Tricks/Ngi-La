import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from '../../components/AppStatusBar';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { useThemeColors } from '../../styles/theme';
import { forgotPassword } from '../../api/auth';
import { ApiError } from '../../api/client';
import type { AuthStackParamList } from '../../router/types';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const colors = useThemeColors();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await forgotPassword(email);
      setSuccessMessage(result.message || `We've sent a password reset link to ${email}.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
        <AppStatusBar />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-verified/10">
            <Feather name="mail" size={26} color={colors.verified} />
          </View>
          <Text className="mt-6 text-xl font-semibold text-foreground">Check your inbox</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">{successMessage}</Text>
          <View className="mt-8 w-full">
            <PrimaryButton label="Back to Log In" onPress={() => navigation.navigate('Login')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <AppStatusBar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1 px-7"
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => navigation.goBack()} className="mt-2 h-9 w-9 items-center justify-center">
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>

          <View className="mt-6">
            <Text className="text-2xl font-semibold text-foreground">Forgot password?</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Enter the email on your account and we'll send you a link to reset it.
            </Text>
          </View>

          <View className="mt-8 gap-3.5">
            <TextField
              label="Email"
              icon="mail"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setError(null);
              }}
            />

            {!!error && <Text className="text-sm text-destructive">{error}</Text>}

            <View className="mt-1">
              <PrimaryButton label="Send Reset Link" onPress={handleSubmit} loading={isSubmitting} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
