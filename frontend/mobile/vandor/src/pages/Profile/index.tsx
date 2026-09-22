import React from 'react';
import { Text, View } from 'react-native';
import ScreenContainer from '../../layout/ScreenContainer';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const { session, logout } = useAuth();
  const user = session?.user;

  return (
    <ScreenContainer scroll className="pt-6 gap-4">
      <Text className="text-2xl font-bold text-foreground">Profile</Text>

      <GlassCard className="bg-white/70">
        <View className="gap-2">
          <Row label="Full names" value={user?.fullNames || '—'} />
          <Row label="Gender" value={user?.gender || '—'} />
          <Row label="Phone" value={user?.phoneNumber || '—'} />
          <Row label="Email" value={user?.email || '—'} />
        </View>
      </GlassCard>

      <PrimaryButton label="Log Out" onPress={logout} variant="outline" />
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border py-2 last:border-0">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium capitalize text-foreground">{value}</Text>
    </View>
  );
}
