import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../styles/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export default function Checkbox({ checked, onChange, label }: CheckboxProps) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={() => onChange(!checked)} className="flex-row items-start gap-3 py-1">
      <View
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
          checked ? 'border-primary bg-primary' : 'border-border bg-card'
        }`}
      >
        {checked && <Feather name="check" size={13} color={colors.primaryForeground} />}
      </View>
      <Text className="flex-1 text-sm leading-5 text-foreground">{label}</Text>
    </Pressable>
  );
}
