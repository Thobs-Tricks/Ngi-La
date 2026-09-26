import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Logo from '../../components/Logo';
import { gradients } from '../../styles/theme';

// Shown while a persisted session is being restored, before we know whether
// to land on Auth or the main tabs.
export default function SplashScreen() {
  return (
    <LinearGradient colors={gradients.terracotta} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} className="flex-1">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center gap-3 px-10">
        <Logo variant="full" size={220} />
        <Text className="text-sm font-medium tracking-wide text-primary-foreground/90">
          Vendor Portal
        </Text>
      </View>
    </LinearGradient>
  );
}
