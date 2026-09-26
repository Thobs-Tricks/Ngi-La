import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../layout/ScreenContainer';
import PrimaryButton from '../../components/PrimaryButton';
import AppStatusBar from '../../components/AppStatusBar';
import { useAuth } from '../../hooks/useAuth';
import { useDarkModeToggle } from '../../lib/theme';
import { gradients, useThemeColors } from '../../styles/theme';
import type { ProfileStackParamList } from '../../router/types';

function initialsOf(firstName?: string, lastName?: string): string {
  const a = firstName?.[0] ?? '';
  const b = lastName?.[0] ?? '';
  return (a + b).toUpperCase() || '—';
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { session, logout } = useAuth();
  const { isDark, toggle } = useDarkModeToggle();
  const colors = useThemeColors();

  const user = session?.user;
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const memberSince = formatDate(user?.createdAt);

  return (
    <ScreenContainer scroll className="pt-8">
      <AppStatusBar />
      <View className="pb-10">
        <View className="items-center">
          <LinearGradient
            colors={gradients.terracotta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-[92px] w-[92px] items-center justify-center rounded-full p-[3px]"
          >
            <View className="h-full w-full items-center justify-center rounded-full bg-card">
              <Text className="text-2xl font-semibold text-primary">
                {initialsOf(user?.firstName, user?.lastName)}
              </Text>
            </View>
          </LinearGradient>
          <Text className="mt-4 text-xl font-semibold text-foreground">{fullName || 'Vendor'}</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">{user?.email ?? '—'}</Text>
        </View>

        <SectionLabel label="Account" />
        <View className="rounded-2xl border border-border bg-card px-4">
          <InfoRow label="Phone" value={user?.phoneNumber || '—'} />
          <InfoRow label="Gender" value={user?.gender || '—'} />
          <InfoRow label="Vendor since" value={memberSince ?? '—'} last />
        </View>

        <SectionLabel label="Settings" />
        <View className="rounded-2xl border border-border bg-card px-4">
          <View className="flex-row items-center justify-between border-b border-border py-3.5">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Feather name="moon" size={14} color={colors.mutedForeground} />
              </View>
              <Text className="text-sm text-foreground">Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          <Pressable
            onPress={() => navigation.navigate('ChangePassword')}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Feather name="lock" size={14} color={colors.mutedForeground} />
              </View>
              <Text className="text-sm text-foreground">Change Password</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <SectionLabel label="Spaza" />
        <View className="rounded-2xl border border-border bg-card px-4">
          <Pressable
            onPress={() => navigation.navigate('Reviews')}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-accent/15">
                <Feather name="star" size={14} color={colors.accent} />
              </View>
              <Text className="text-sm text-foreground">Customer Reviews</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <SectionLabel label="Legal" />
        <View className="rounded-2xl border border-border bg-card px-4">
          <Pressable
            onPress={() => navigation.navigate('Terms')}
            className="flex-row items-center justify-between py-3.5"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Feather name="file-text" size={14} color={colors.mutedForeground} />
              </View>
              <Text className="text-sm text-foreground">Terms &amp; Conditions</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View className="mt-8">
          <PrimaryButton label="Log Out" onPress={logout} variant="outline" />
        </View>
      </View>
    </ScreenContainer>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="mb-2 mt-7 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </Text>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between py-3.5 ${last ? '' : 'border-b border-border'}`}>
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}
