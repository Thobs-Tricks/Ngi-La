import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Logo from '../../components/Logo';
import GlassCard from '../../components/GlassCard';
import TextField from '../../components/TextField';
import GenderSelect from '../../components/GenderSelect';
import Checkbox from '../../components/Checkbox';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { gradients } from '../../styles/theme';
import type { AuthStackParamList } from '../../router/types';
import type { Gender } from '../../types';

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { register, isSubmitting, error, clearError } = useAuth();

  const [fullNames, setFullNames] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFormError(null);

    if (!fullNames || !gender || !phoneNumber || !email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (!acceptedTerms) {
      setFormError('Please accept the Terms & Conditions to continue.');
      return;
    }

    try {
      await register({ fullNames, gender, phoneNumber, email, password, acceptedTerms });
    } catch {
      // error is surfaced via context
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <LinearGradient colors={gradients.sunset} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} className="h-52 items-center justify-center pt-10">
        <Logo variant="mark" size={56} />
        <Text className="mt-2 text-xl font-bold text-primary-foreground">Create your account</Text>
        <Text className="mt-1 text-sm text-primary-foreground/80">Join Vandor as a vendor</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 -mt-8">
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <GlassCard className="bg-white/60">
            <View className="gap-4">
              <TextField
                label="Full Names"
                autoCapitalize="words"
                placeholder="e.g. Thabo Nkosi"
                value={fullNames}
                onChangeText={(v) => {
                  setFullNames(v);
                  clearError();
                  setFormError(null);
                }}
              />

              <GenderSelect value={gender} onChange={setGender} />

              <TextField
                label="Phone Number"
                keyboardType="phone-pad"
                placeholder="e.g. 082 000 0000"
                value={phoneNumber}
                onChangeText={(v) => {
                  setPhoneNumber(v);
                  clearError();
                  setFormError(null);
                }}
              />

              <TextField
                label="Email"
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
          </GlassCard>

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-sm text-muted-foreground">Already have an account?</Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text className="text-sm font-semibold text-primary">Log In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
