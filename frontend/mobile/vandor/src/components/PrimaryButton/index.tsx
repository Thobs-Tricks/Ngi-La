import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../styles/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
}

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'solid',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`items-center justify-center rounded-2xl border border-primary py-4 ${
          isDisabled ? 'opacity-50' : ''
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#C64E26" />
        ) : (
          <Text className="text-base font-semibold text-primary">{label}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={isDisabled} className={isDisabled ? 'opacity-50' : ''}>
      <LinearGradient
        colors={gradients.sunset}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16 }}
        className="items-center justify-center py-4"
      >
        {loading ? (
          <ActivityIndicator color="#FEFAF1" />
        ) : (
          <Text className="text-base font-semibold text-primary-foreground">{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
