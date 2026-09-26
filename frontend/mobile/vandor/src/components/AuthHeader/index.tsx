import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../Logo';
import { gradients } from '../../styles/theme';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  /** Smaller, quieter version for secondary screens like Forgot Password. */
  compact?: boolean;
}

// The playful bit: a gradient "hero" panel with a few soft translucent blobs
// floating behind a gently rocking logo badge. Same terracotta family as the
// rest of the app — just given room to have some fun with it.
export default function AuthHeader({ title, subtitle, compact = false }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();
  const tilt = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rock = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: -1, duration: 3000, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    rock.start();
    Animated.timing(rise, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    return () => rock.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotate = tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] });

  return (
    <LinearGradient
      colors={gradients.terracotta}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      className={`overflow-hidden rounded-b-[36px] px-7 ${compact ? 'pb-7' : 'pb-11'}`}
      style={{ paddingTop: insets.top + (compact ? 12 : 20) }}
    >
      <View pointerEvents="none" className="absolute -right-9 -top-12 h-40 w-40 rounded-full bg-white/10" />
      <View pointerEvents="none" className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-white/10" />
      <View pointerEvents="none" className="absolute bottom-2 right-12 h-4 w-4 rounded-full bg-accent/70" />
      <View pointerEvents="none" className="absolute bottom-10 left-10 h-3 w-3 rounded-full bg-white/40" />
      <View pointerEvents="none" className="absolute right-24 top-6 h-2.5 w-2.5 rounded-full bg-white/50" />

      <Animated.View
        style={{
          opacity: rise,
          transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        }}
        className="items-center"
      >
        <Animated.View
          style={[styles.badgeShadow, { transform: [{ rotate }] }]}
          className={`items-center justify-center rounded-full bg-sand ${compact ? 'h-16 w-16' : 'h-20 w-20'}`}
        >
          <Logo variant="mark" size={compact ? 34 : 44} />
        </Animated.View>
        <Text className={`text-primary-foreground font-bold ${compact ? 'mt-3 text-xl' : 'mt-4 text-2xl'}`}>
          {title}
        </Text>
        <Text className="mt-1 text-center text-sm text-primary-foreground/80">{subtitle}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badgeShadow: {
    shadowColor: '#241D0D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
});
