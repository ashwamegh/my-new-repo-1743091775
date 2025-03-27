import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView, 
  Animated,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  
  const [endSoundEnabled, setEndSoundEnabled] = React.useState(true);
  const [keepScreenOn, setKeepScreenOn] = React.useState(true);
  const [hapticFeedback, setHapticFeedback] = React.useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);
  
  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => 
    (value: boolean) => {
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setter(value);
    };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 28 }} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                Use dark theme throughout the app
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ 
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }) 
              }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meditation</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>End Sound</Text>
              <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                Play a sound when meditation ends
              </Text>
            </View>
            <Switch
              value={endSoundEnabled}
              onValueChange={handleToggle(setEndSoundEnabled)}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={endSoundEnabled ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Keep Screen On</Text>
              <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                Prevent screen from sleeping during meditation
              </Text>
            </View>
            <Switch
              value={keepScreenOn}
              onValueChange={handleToggle(setKeepScreenOn)}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={keepScreenOn ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Haptic Feedback</Text>
              <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                Vibration feedback for controls
              </Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={handleToggle(setHapticFeedback)}
              trackColor={{ false: '#3e3e3e', true: colors.primary }}
              thumbColor={hapticFeedback ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ 
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [150, 0],
                }) 
              }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          
          <TouchableOpacity 
            style={[styles.aboutItem, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.aboutItemText, { color: colors.text }]}>Version 1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.aboutItem, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.aboutItemText, { color: colors.text }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.aboutItem, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.aboutItemText, { color: colors.text }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  aboutItemText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});