import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../styles/theme';

type Tint = 'primary' | 'accent' | 'verified' | 'secondary';

interface StatCardProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
  /** small trailing caption, e.g. "+3 this week" */
  caption?: string;
  tint?: Tint;
}

const BADGE_CLASSES: Record<Tint, string> = {
  primary: 'bg-primary/10 border-primary/20',
  accent: 'bg-accent/15 border-accent/25',
  verified: 'bg-verified/10 border-verified/20',
  secondary: 'bg-secondary border-border',
};

export default function StatCard({ icon, label, value, caption, tint = 'primary' }: StatCardProps) {
  const colors = useThemeColors();
  const iconColor = tint === 'secondary' ? colors.secondaryForeground : colors[tint];

  return (
    <View className="flex-1 rounded-2xl border border-border bg-card p-4">
      <View className={`h-9 w-9 items-center justify-center rounded-full border ${BADGE_CLASSES[tint]}`}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <Text className="mt-3 text-2xl font-semibold text-foreground">{value}</Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">{label}</Text>
      {!!caption && <Text className="mt-1 text-[11px] font-medium text-verified">{caption}</Text>}
    </View>
  );
}
