import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Gender } from '../../types';

const OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
];

interface GenderSelectProps {
  value: Gender | null;
  onChange: (value: Gender) => void;
}

export default function GenderSelect({ value, onChange }: GenderSelectProps) {
  return (
    <View className="w-full">
      <Text className="mb-1.5 text-sm font-medium text-foreground">Gender</Text>
      <View className="flex-row gap-2">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className={`flex-1 items-center rounded-2xl border py-3 ${
                active ? 'border-primary bg-primary' : 'border-border bg-card'
              }`}
            >
              <Text className={`text-sm font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
