import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../layout/ScreenContainer';
import StatCard from '../../components/StatCard';
import AppStatusBar from '../../components/AppStatusBar';
import { useAuth } from '../../hooks/useAuth';
import { gradients, useThemeColors } from '../../styles/theme';

// UI-only placeholder data — swap for the real numbers once the backend
// exposes tags / views / saves for a vendor. Reviews is wired for real.
const STATS = [
  { icon: 'star' as const, label: 'Reviews', value: '24', caption: '4.8 avg rating', tint: 'accent' as const },
  { icon: 'at-sign' as const, label: 'Tagged Posts', value: '12', caption: '+3 this week', tint: 'primary' as const },
  { icon: 'eye' as const, label: 'Profile Views', value: '138', caption: '+18 this week', tint: 'verified' as const },
  { icon: 'bookmark' as const, label: 'Saved by Customers', value: '9', tint: 'secondary' as const },
];

const ACTIVITY = [
  { icon: 'star' as const, text: 'Lindiwe M. left a 5-star review', time: '2h ago', tint: 'accent' as const },
  { icon: 'at-sign' as const, text: 'Tagged in a post by @sipho_eats', time: '1d ago', tint: 'primary' as const },
  { icon: 'bookmark' as const, text: 'Your spaza was saved by a new customer', time: '2d ago', tint: 'verified' as const },
];

const ACTIVITY_TINT: Record<string, string> = {
  accent: 'bg-accent/15',
  primary: 'bg-primary/10',
  verified: 'bg-verified/10',
};

const QUICK_ACTIONS = [
  { icon: 'shopping-bag' as const, label: 'My Spaza', screen: 'MySpaza' as const },
  { icon: 'star' as const, label: 'Reviews', screen: 'Profile' as const, nested: 'Reviews' },
  { icon: 'user' as const, label: 'Profile', screen: 'Profile' as const },
];

export default function DashboardScreen() {
  const { session } = useAuth();
  const colors = useThemeColors();
  const navigation = useNavigation<any>();
  const firstName = session?.user.firstName ?? 'there';

  return (
    <ScreenContainer scroll className="pt-6">
      <AppStatusBar />

      <LinearGradient
        colors={gradients.terracotta}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden rounded-3xl px-5 py-5"
      >
        <View pointerEvents="none" className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <View pointerEvents="none" className="absolute -bottom-6 left-16 h-16 w-16 rounded-full bg-white/10" />
        <Text className="text-sm text-primary-foreground/80">Welcome back,</Text>
        <Text className="mt-0.5 text-2xl font-bold text-primary-foreground">{firstName} 👋</Text>
        <Text className="mt-2 text-xs text-primary-foreground/70">Here's how your spaza is doing today</Text>
      </LinearGradient>

      <View className="mt-4 flex-row gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            onPress={() =>
              action.nested
                ? navigation.navigate(action.screen, { screen: action.nested })
                : navigation.navigate(action.screen)
            }
            className="flex-1 items-center gap-1.5 rounded-2xl border border-border bg-card py-3"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Feather name={action.icon} size={16} color={colors.primary} />
            </View>
            <Text className="text-xs font-medium text-foreground">{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-5 flex-row gap-3">
        <Pressable className="flex-1" onPress={() => navigation.navigate('Profile', { screen: 'Reviews' })}>
          <StatCard {...STATS[0]} />
        </Pressable>
        <StatCard {...STATS[1]} />
      </View>
      <View className="mt-3 flex-row gap-3">
        <StatCard {...STATS[2]} />
        <StatCard {...STATS[3]} />
      </View>

      <Text className="mb-2 mt-7 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Recent Activity
      </Text>
      <View className="rounded-2xl border border-border bg-card">
        {ACTIVITY.map((item, i) => (
          <View
            key={item.text}
            className={`flex-row items-center gap-3 px-4 py-3.5 ${
              i === ACTIVITY.length - 1 ? '' : 'border-b border-border'
            }`}
          >
            <View className={`h-8 w-8 items-center justify-center rounded-full ${ACTIVITY_TINT[item.tint]}`}>
              <Feather name={item.icon} size={14} color={colors[item.tint]} />
            </View>
            <Text className="flex-1 text-sm text-foreground">{item.text}</Text>
            <Text className="text-xs text-muted-foreground">{item.time}</Text>
          </View>
        ))}
      </View>

      <View className="mb-6 mt-6 flex-row items-start gap-3 rounded-2xl border border-dashed border-border bg-card p-4">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-muted">
          <Feather name="trending-up" size={16} color={colors.mutedForeground} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-foreground">Sales overview</Text>
            <View className="rounded-full bg-muted px-2 py-0.5">
              <Text className="text-[10px] font-semibold text-muted-foreground">Coming soon</Text>
            </View>
          </View>
          <Text className="mt-1 text-sm text-muted-foreground">
            Orders, stock and earnings will show up here once that part of the backend is connected.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
