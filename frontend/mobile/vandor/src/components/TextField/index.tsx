import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../styles/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  icon?: React.ComponentProps<typeof Feather>['name'];
}

export default function TextField({ label, error, isPassword = false, icon, ...rest }: TextFieldProps) {
  const [hidden, setHidden] = useState(isPassword);
  const colors = useThemeColors();

  return (
    <View className="w-full">
      <Text className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      <View
        className={`flex-row items-center gap-2.5 rounded-xl border bg-card px-3.5 ${
          error ? 'border-destructive' : 'border-border'
        }`}
      >
        {icon && <Feather name={icon} size={16} color={colors.mutedForeground} />}
        <TextInput
          className="flex-1 py-3 text-base text-foreground"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={hidden}
          {...rest}
        />
        {isPassword && (
          <Feather
            name={hidden ? 'eye' : 'eye-off'}
            size={16}
            color={colors.mutedForeground}
            onPress={() => setHidden((h) => !h)}
            suppressHighlighting
          />
        )}
      </View>
      {!!error && <Text className="mt-1 text-xs text-destructive">{error}</Text>}
    </View>
  );
}
