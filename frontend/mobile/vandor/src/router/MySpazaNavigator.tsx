import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MySpazaFormScreen from '../pages/MySpaza';
import MapPickerScreen from '../pages/MySpaza/MapPicker';
import { useThemeColors } from '../styles/theme';
import type { MySpazaStackParamList } from './types';

const Stack = createNativeStackNavigator<MySpazaStackParamList>();

export default function MySpazaNavigator() {
  const colors = useThemeColors();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="MySpazaForm" component={MySpazaFormScreen} />
      <Stack.Screen name="MapPicker" component={MapPickerScreen} options={{ presentation: 'fullScreenModal' }} />
    </Stack.Navigator>
  );
}
