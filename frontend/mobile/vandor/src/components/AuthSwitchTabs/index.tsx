import React, { useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, Text, View } from 'react-native';

interface AuthSwitchTabsProps {
  active: 'login' | 'register';
  onSelect: (tab: 'login' | 'register') => void;
}

// A pill-shaped segmented control that floats half over the hero header,
// giving Login/Register a shared, game-like "switch" instead of a plain
// text link buried at the bottom of the screen.
export default function AuthSwitchTabs({ active, onSelect }: AuthSwitchTabsProps) {
  const [width, setWidth] = useState(0);
  const slide = useRef(new Animated.Value(active === 'login' ? 0 : 1)).current;

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const select = (tab: 'login' | 'register') => {
    if (tab === active) return;
    Animated.spring(slide, { toValue: tab === 'login' ? 0 : 1, useNativeDriver: true, friction: 9 }).start();
    onSelect(tab);
  };

  const half = width / 2;

  return (
    <View
      onLayout={handleLayout}
      className="mx-auto -mt-7 h-14 w-[86%] flex-row items-center rounded-full border border-border bg-card p-1.5"
      style={{ shadowColor: '#241D0D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 }}
    >
      {width > 0 && (
        <Animated.View
          className="absolute h-11 rounded-full bg-primary"
          style={{
            width: half - 6,
            left: 6,
            transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, half] }) }],
          }}
        />
      )}
      <Pressable onPress={() => select('login')} className="z-10 flex-1 items-center justify-center">
        <Text className={`text-sm font-semibold ${active === 'login' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
          Log In
        </Text>
      </Pressable>
      <Pressable onPress={() => select('register')} className="z-10 flex-1 items-center justify-center">
        <Text className={`text-sm font-semibold ${active === 'register' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
          Sign Up
        </Text>
      </Pressable>
    </View>
  );
}
