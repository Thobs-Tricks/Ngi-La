import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useThemeColors } from '../styles/theme';
import SplashScreen from '../pages/Splash';
import AuthNavigator from './AuthNavigator';
import TabNavigator from '../layout/TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Decides what the user sees first: the splash screen while a persisted
// session is being restored, then either the auth flow or the main tabs.
export default function RootNavigator() {
  const { session, isRestoring } = useAuth();
  const colors = useThemeColors();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      {isRestoring ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : session ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
