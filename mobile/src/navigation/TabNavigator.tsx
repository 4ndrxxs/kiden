import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { HomeScreen } from '../screens/HomeScreen';
import { RecordScreen } from '../screens/RecordScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type TabParamList = {
  Home: undefined;
  Record: undefined;
  Chat: undefined;
  ReportTab: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabConfig: Record<keyof TabParamList, { label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }> = {
  Home: { label: '홈', icon: 'home-outline', iconActive: 'home' },
  Record: { label: '기록', icon: 'create-outline', iconActive: 'create' },
  Chat: { label: 'AI 상담', icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses' },
  ReportTab: { label: '리포트', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  Settings: { label: '설정', icon: 'settings-outline', iconActive: 'settings' },
};

function KidenTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.tabBarWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config = tabConfig[route.name as keyof TabParamList];
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={({ pressed }) => [styles.tabItem, { opacity: pressed ? 0.84 : 1 }]}>
              <Ionicons
                name={focused ? config.iconActive : config.icon}
                size={22}
                color={focused ? colors.primary.main : colors.text.tertiary}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{config.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <KidenTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Record" component={RecordScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="ReportTab" component={ReportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingVertical: 10,
    shadowColor: colors.shadow.card,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  tabLabelActive: {
    color: colors.primary.main,
  },
});
