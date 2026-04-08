import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

import { HomeScreen } from '../screens/HomeScreen';
import { RecordScreen } from '../screens/RecordScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type TabParamList = {
  Home: undefined;
  Record: undefined;
  Chat: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabConfig: Record<keyof TabParamList, {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}> = {
  Home: { label: '홈', icon: 'home-outline', iconFocused: 'home' },
  Record: { label: '기록', icon: 'create-outline', iconFocused: 'create' },
  Chat: { label: 'AI 상담', icon: 'chatbubble-ellipses-outline', iconFocused: 'chatbubble-ellipses' },
  Settings: { label: '설정', icon: 'settings-outline', iconFocused: 'settings' },
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill}>
            <View style={styles.tabBarBg} />
          </BlurView>
        ),
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {(Object.keys(tabConfig) as (keyof TabParamList)[]).map((name) => {
        const config = tabConfig[name];
        return (
          <Tab.Screen
            key={name}
            name={name}
            component={
              name === 'Home' ? HomeScreen :
              name === 'Record' ? RecordScreen :
              name === 'Chat' ? ChatScreen :
              SettingsScreen
            }
            options={{
              tabBarLabel: config.label,
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? config.iconFocused : config.icon}
                  size={24}
                  color={color}
                />
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: 85,
    paddingTop: 8,
  },
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glass.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border.light,
  },
  tabLabel: {
    ...typography.label,
    marginTop: 2,
  },
});
