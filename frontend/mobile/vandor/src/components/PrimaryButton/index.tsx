import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useThemeColors } from '../../styles/theme';

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
  const colors = useThemeColors();

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`items-center justify-center rounded-xl border border-primary py-3.5 ${
          isDisabled ? 'opacity-50' : ''
        }`}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text className="text-base font-semibold text-primary">{label}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center justify-center rounded-xl bg-primary py-3.5 ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryForeground} />
      ) : (
        <Text className="text-base font-semibold text-primary-foreground">{label}</Text>
      )}
    </Pressable>
  );
}
