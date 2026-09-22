import React from 'react';
import { Text, View } from 'react-native';
import ScreenContainer from '../../layout/ScreenContainer';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardScreen() {
  const { session } = useAuth();
  const firstName = session?.user.fullNames?.split(' ')[0] ?? 'there';

  return (
    <ScreenContainer scroll className="pt-6 gap-4">
      <View>
        <Text className="text-sm text-muted-foreground">Welcome back,</Text>
        <Text className="text-2xl font-bold text-foreground">{firstName} 👋</Text>
      </View>

      <GlassCard className="bg-white/70">
        <Text className="text-sm text-muted-foreground">Today's overview</Text>
        <Text className="mt-2 text-lg font-semibold text-foreground">No sales data yet</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          This dashboard is a placeholder — orders, stock and earnings will show up here once the
          backend is connected.
        </Text>
      </GlassCard>
    </ScreenContainer>
  );
}
