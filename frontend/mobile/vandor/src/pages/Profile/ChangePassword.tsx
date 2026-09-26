import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from '../../components/AppStatusBar';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../styles/theme';
import { changePassword } from '../../api/auth';
import { ApiError } from '../../api/client';
import type { ProfileStackParamList } from '../../router/types';

export default function ChangePasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { session } = useAuth();
  const colors = useThemeColors();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    if (!session?.accessToken) {
      setError('Your session has expired — please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changePassword(session.accessToken, currentPassword, newPassword);
      setSuccessMessage(result.message || 'Your password has been updated.');
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
            <Feather name="check" size={30} color={colors.verified} />
          </View>
          <Text className="mt-6 text-xl font-semibold text-foreground">Password updated</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">{successMessage}</Text>
          <View className="mt-8 w-full">
            <PrimaryButton label="Done" onPress={() => navigation.goBack()} />
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
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="-ml-2 h-9 w-9 items-center justify-center">
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </Pressable>
            <Text className="ml-1 text-lg font-semibold text-foreground">Change Password</Text>
          </View>

          <View className="mt-8 gap-3.5">
            <TextField
              label="Current Password"
              icon="lock"
              isPassword
              placeholder="••••••••"
              value={currentPassword}
              onChangeText={(v) => {
                setCurrentPassword(v);
                setError(null);
              }}
            />
            <TextField
              label="New Password"
              icon="lock"
              isPassword
              placeholder="••••••••"
              value={newPassword}
              onChangeText={(v) => {
                setNewPassword(v);
                setError(null);
              }}
            />
            <TextField
              label="Confirm New Password"
              icon="lock"
              isPassword
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setError(null);
              }}
            />

            {!!error && <Text className="text-sm text-destructive">{error}</Text>}

            <View className="mt-1">
              <PrimaryButton label="Update Password" onPress={handleSubmit} loading={isSubmitting} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
