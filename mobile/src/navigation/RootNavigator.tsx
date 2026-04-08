import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { TabNavigator } from './TabNavigator';

import { AuthScreen } from '../screens/AuthScreen';
import { DailyRecordScreen } from '../screens/DailyRecordScreen';
import { DialysisRecordScreen } from '../screens/DialysisRecordScreen';
import { MealRecordScreen } from '../screens/MealRecordScreen';
import { WaterIntakeScreen } from '../screens/WaterIntakeScreen';
import { ReportScreen } from '../screens/ReportScreen';

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  DailyRecord: undefined;
  DialysisRecord: undefined;
  MealRecord: undefined;
  WaterIntake: undefined;
  Report: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="DailyRecord" component={DailyRecordScreen} />
            <Stack.Screen name="DialysisRecord" component={DialysisRecordScreen} />
            <Stack.Screen name="MealRecord" component={MealRecordScreen} />
            <Stack.Screen name="WaterIntake" component={WaterIntakeScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ animation: 'fade' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
