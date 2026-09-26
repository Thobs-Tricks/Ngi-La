import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../pages/Profile';
import ChangePasswordScreen from '../pages/Profile/ChangePassword';
import ReviewsScreen from '../pages/Reviews';
import TermsScreen from '../pages/Legal/Terms';
import { useThemeColors } from '../styles/theme';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  const colors = useThemeColors();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
