import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from '../../components/AppStatusBar';
import AuthHeader from '../../components/AuthHeader';
import AuthSwitchTabs from '../../components/AuthSwitchTabs';
import TextField from '../../components/TextField';
import GenderSelect from '../../components/GenderSelect';
import Checkbox from '../../components/Checkbox';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../styles/theme';
import type { AuthStackParamList } from '../../router/types';
import type { Gender } from '../../types';

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { register, isSubmitting, error, clearError } = useAuth();
  const colors = useThemeColors();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFormError(null);

    if (!firstName || !lastName || !gender || !phoneNumber || !email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (!acceptedTerms) {
      setFormError('Please accept the Terms & Conditions to continue.');
      return;
    }

    try {
      const message = await register({ firstName, lastName, gender, phoneNumber, email, password, acceptedTerms });
      setSuccessMessage(message);
    } catch {
      // error is surfaced via context
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
          <Text className="mt-6 text-xl font-semibold text-foreground">You're almost in</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">{successMessage}</Text>
          <View className="mt-8 w-full">
            <PrimaryButton label="Go to Log In" onPress={() => navigation.navigate('Login')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right', 'bottom']}>
      <AppStatusBar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader title="Join NGiLA" subtitle="Set up your vendor account in a couple of minutes" compact />
          <AuthSwitchTabs active="register" onSelect={(tab) => tab === 'login' && navigation.replace('Login')} />

          <View className="mt-7 gap-3.5 px-7">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label="First Name"
                  icon="user"
                  autoCapitalize="words"
                  placeholder="Thabo"
                  value={firstName}
                  onChangeText={(v) => {
                    setFirstName(v);
                    clearError();
                    setFormError(null);
                  }}
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Last Name"
                  autoCapitalize="words"
                  placeholder="Nkosi"
                  value={lastName}
                  onChangeText={(v) => {
                    setLastName(v);
                    clearError();
                    setFormError(null);
                  }}
                />
              </View>
            </View>

            <GenderSelect value={gender} onChange={setGender} />

            <TextField
              label="Phone Number"
              icon="phone"
              keyboardType="phone-pad"
              placeholder="082 000 0000"
              value={phoneNumber}
              onChangeText={(v) => {
                setPhoneNumber(v);
                clearError();
                setFormError(null);
              }}
            />

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
                setFormError(null);
              }}
            />

            <TextField
              label="Password"
              icon="lock"
              isPassword
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                clearError();
                setFormError(null);
              }}
            />

            <Checkbox
              checked={acceptedTerms}
              onChange={(v) => {
                setAcceptedTerms(v);
                setFormError(null);
              }}
              label="I agree to the "
              linkText="Terms & Conditions"
              onLinkPress={() => navigation.navigate('Terms')}
            />

            {!!(formError || error) && (
              <Text className="text-sm text-destructive">{formError || error}</Text>
            )}

            <View className="mt-2">
              <PrimaryButton label="Create Account" onPress={handleSubmit} loading={isSubmitting} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
