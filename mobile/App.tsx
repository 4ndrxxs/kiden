import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { checkAndApplyUpdate } from './src/utils/updates';
import { useUserStore } from './src/stores/userStore';
import { colors } from './src/theme/colors';

export default function App() {
  const { initialize, isLoading, session } = useUserStore();

  useEffect(() => {
    initialize();
    checkAndApplyUpdate(true);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigator isAuthenticated={!!session} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
