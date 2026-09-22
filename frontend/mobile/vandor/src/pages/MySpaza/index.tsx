import React from 'react';
import { Text, View } from 'react-native';
import ScreenContainer from '../../layout/ScreenContainer';
import GlassCard from '../../components/GlassCard';

export default function MySpazaScreen() {
  return (
    <ScreenContainer scroll className="pt-6 gap-4">
      <Text className="text-2xl font-bold text-foreground">My Spaza</Text>

      <GlassCard className="bg-white/70">
        <Text className="text-sm text-muted-foreground">Shop profile</Text>
        <Text className="mt-2 text-lg font-semibold text-foreground">Not set up yet</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Add your spaza's name, location and catalogue here once vendor profile management is
          built.
        </Text>
      </GlassCard>
    </ScreenContainer>
  );
}
