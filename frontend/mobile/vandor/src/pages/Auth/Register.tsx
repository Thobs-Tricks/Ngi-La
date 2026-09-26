import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppStatusBar from '../../components/AppStatusBar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <AppStatusBar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1 px-7"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingTop: 8, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View className="items-center pt-8">
              <Logo variant="mark" size={44} />
              <Text className="mt-4 text-2xl font-semibold text-foreground">Create your account</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Join NGiLA as a vendor</Text>
            </View>

            <View className="mt-8 gap-3.5">
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
                label="I agree to the Terms & Conditions"
              />

              {!!(formError || error) && (
                <Text className="text-sm text-destructive">{formError || error}</Text>
              )}

              <View className="mt-2">
                <PrimaryButton label="Register" onPress={handleSubmit} loading={isSubmitting} />
              </View>
            </View>
          </View>

          <View className="flex-row justify-center gap-1 pb-2 pt-6">
            <Text className="text-sm text-muted-foreground">Already have an account?</Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text className="text-sm font-semibold text-primary">Log In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
