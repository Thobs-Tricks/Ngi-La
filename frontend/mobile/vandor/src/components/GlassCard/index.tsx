import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  /** BlurView intensity, 0-100 */
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  className?: string;
}

// A frosted "glassmorphism" card: blurred, translucent, softly bordered.
export default function GlassCard({
  children,
  intensity = 40,
  tint = 'light',
  className = '',
  style,
  ...rest
}: GlassCardProps) {
  return (
    <View
      className={`overflow-hidden rounded-2xl border border-white/40 ${className}`}
      style={[styles.shadow, style]}
      {...rest}
    >
      <BlurView intensity={intensity} tint={tint} className="p-4">
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#241D0D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
});
