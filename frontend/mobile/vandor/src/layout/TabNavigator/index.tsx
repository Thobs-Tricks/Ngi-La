import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import DashboardScreen from '../../pages/Dashboard';
import MySpazaNavigator from '../../router/MySpazaNavigator';
import ProfileNavigator from '../../router/ProfileNavigator';
import { useThemeColors } from '../../styles/theme';
import type { MainTabParamList } from '../../router/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Feather.glyphMap> = {
  Dashboard: 'home',
  MySpaza: 'shopping-bag',
  Profile: 'user',
};

// The vendor app's main tab bar — Dashboard (home), My Spaza (vendor profile),
// and Profile (account/settings).
export default function TabNavigator() {
  const colors = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Feather name={ICONS[route.name as keyof MainTabParamList]} size={size ?? 22} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="MySpaza" component={MySpazaNavigator} options={{ title: 'My Spaza' }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
