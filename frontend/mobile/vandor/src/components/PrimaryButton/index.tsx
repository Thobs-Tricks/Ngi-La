import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, Text } from 'react-native';
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
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  if (variant === 'outline') {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
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
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        className={`items-center justify-center rounded-xl bg-primary py-3.5 ${isDisabled ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text className="text-base font-semibold text-primary-foreground">{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
