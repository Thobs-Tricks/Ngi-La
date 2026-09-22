import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Logo from '../../components/Logo';
import GlassCard from '../../components/GlassCard';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { gradients } from '../../styles/theme';
import type { AuthStackParamList } from '../../router/types';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login, isSubmitting, error, clearError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await login({ identifier, password });
    } catch {
      // error is surfaced via context
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <LinearGradient colors={gradients.sunset} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} className="h-64 items-center justify-center pt-10">
        <Logo variant="mark" size={64} />
        <Text className="mt-3 text-xl font-bold text-primary-foreground">Welcome back</Text>
        <Text className="mt-1 text-sm text-primary-foreground/80">Log in to manage your spaza</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 -mt-10">
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <GlassCard className="bg-white/60">
            <View className="gap-4">
              <TextField
                label="Phone or Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="e.g. 082 000 0000 or you@example.com"
                value={identifier}
                onChangeText={(v) => {
                  setIdentifier(v);
                  clearError();
                }}
              />
              <TextField
                label="Password"
                isPassword
                placeholder="••••••••"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  clearError();
                }}
              />

              {!!error && <Text className="text-sm text-destructive">{error}</Text>}

              <View className="mt-2">
                <PrimaryButton label="Log In" onPress={handleSubmit} loading={isSubmitting} />
              </View>
            </View>
          </GlassCard>

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-sm text-muted-foreground">Don't have an account?</Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text className="text-sm font-semibold text-primary">Register</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
