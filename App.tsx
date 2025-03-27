import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { useKeepAwake } from 'expo-keep-awake';
import { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';

import HomeScreen from './screens/HomeScreen';
import MeditationScreen from './screens/MeditationScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatsScreen from './screens/StatsScreen';
import { SoundProvider } from './context/SoundContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Analytics } from './utils/analytics';
import './global.css';

// Keep splash screen visible until we're ready
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore errors */
});

const Stack = createNativeStackNavigator();

// Configure linking for deep links
const linking = {
  prefixes: [
    Linking.createURL('/'),
    'https://serenity-meditation.app',
    'serenity://'
  ],
  config: {
    screens: {
      Home: '',
      Meditation: 'meditation/:duration?',
      Settings: 'settings',
      Stats: 'stats',
    },
  },
};

export default function App() {
  // Only use keep awake during development
  if (__DEV__) {
    useKeepAwake();
  }
  
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Home');
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Handle app state changes for analytics
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        Analytics.logEvent('app_opened');
      } else if (nextAppState === 'background') {
        Analytics.logEvent('app_backgrounded');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Initialize analytics
  useEffect(() => {
    Analytics.initialize().catch(console.error);
  }, []);

  // Handle initial deep link
  useEffect(() => {
    const getInitialLink = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          const { path } = Linking.parse(url);
          if (path) {
            if (path.startsWith('meditation')) {
              setInitialRoute('Meditation');
            } else if (path === 'settings') {
              setInitialRoute('Settings');
            } else if (path === 'stats') {
              setInitialRoute('Stats');
            }
          }
        }
      } catch (e) {
        console.warn('Failed to get initial deep link', e);
      }
    };

    getInitialLink();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync().catch(() => {
        /* ignore errors */
      });
    }
  }, [appIsReady]);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        if (fontsLoaded) {
          // Wait for a moment to avoid flicker
          await new Promise(resolve => setTimeout(resolve, 500));
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn('Error during app initialization:', e);
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A076F9" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <ThemeProvider>
          <SoundProvider>
            <NavigationContainer
              linking={linking}
              fallback={
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#A076F9" />
                </View>
              }
            >
              <StatusBar style="light" />
              <Stack.Navigator 
                initialRouteName={initialRoute}
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#141414' },
                  animation: Platform.OS === 'ios' ? 'fade_from_bottom' : 'fade',
                  animationDuration: 200,
                }}
              >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Meditation" component={MeditationScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Stats" component={StatsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </SoundProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
});