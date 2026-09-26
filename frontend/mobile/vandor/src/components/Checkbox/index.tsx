import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../styles/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Optional trailing piece of the label rendered as its own tappable link
   * (e.g. "I agree to the " + linkText="Terms & Conditions"). */
  linkText?: string;
  onLinkPress?: () => void;
}

export default function Checkbox({ checked, onChange, label, linkText, onLinkPress }: CheckboxProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-start gap-3 py-1">
      <Pressable onPress={() => onChange(!checked)} hitSlop={6}>
        <View
          className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
            checked ? 'border-primary bg-primary' : 'border-border bg-card'
          }`}
        >
          {checked && <Feather name="check" size={13} color={colors.primaryForeground} />}
        </View>
      </Pressable>
      <Pressable onPress={() => onChange(!checked)} className="flex-1 flex-row flex-wrap">
        <Text className="text-sm leading-5 text-foreground">{label}</Text>
        {!!linkText && (
          <Text
            onPress={onLinkPress}
            suppressHighlighting
            className="text-sm font-semibold leading-5 text-primary underline"
          >
            {linkText}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
