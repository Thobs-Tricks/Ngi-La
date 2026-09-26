import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from '../../components/AppStatusBar';
import Logo from '../../components/Logo';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../router/types';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login, isSubmitting, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await login({ email, password });
    } catch {
      // error is surfaced via context
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <AppStatusBar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1 px-7"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingTop: 8, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View className="items-center pt-12">
              <Logo variant="mark" size={52} />
              <Text className="mt-5 text-2xl font-semibold text-foreground">Welcome back</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Log in to manage your spaza</Text>
            </View>

            <View className="mt-10 gap-3.5">
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
                <Pressable onPress={() => navigation.navigate('ForgotPassword')} className="mt-2 self-end">
                  <Text className="text-xs font-semibold text-primary">Forgot password?</Text>
                </Pressable>
              </View>

              {!!error && <Text className="text-sm text-destructive">{error}</Text>}

              <View className="mt-1">
                <PrimaryButton label="Log In" onPress={handleSubmit} loading={isSubmitting} />
              </View>
            </View>
          </View>

          <View className="flex-row justify-center gap-1 pb-2">
            <Text className="text-sm text-muted-foreground">Don't have an account?</Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text className="text-sm font-semibold text-primary">Register</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
