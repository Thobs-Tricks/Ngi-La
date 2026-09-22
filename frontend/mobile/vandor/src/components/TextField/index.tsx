import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export default function TextField({ label, error, isPassword = false, ...rest }: TextFieldProps) {
  const [hidden, setHidden] = useState(isPassword);

  return (
    <View className="w-full">
      <Text className="mb-1.5 text-sm font-medium text-foreground">{label}</Text>
      <View
        className={`flex-row items-center rounded-2xl border bg-card px-4 ${
          error ? 'border-destructive' : 'border-border'
        }`}
      >
        <TextInput
          className="flex-1 py-3.5 text-base text-foreground"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={hidden}
          {...rest}
        />
        {isPassword && (
          <Feather
            name={hidden ? 'eye' : 'eye-off'}
            size={18}
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
