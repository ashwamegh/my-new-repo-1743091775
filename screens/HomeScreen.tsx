import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import MeditationCard from '../components/MeditationCard';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const meditationSessions = [
    { 
      id: '1', 
      title: 'Quick Focus', 
      duration: 5, 
      description: 'A short meditation to regain focus',
      icon: 'flash-outline' 
    },
    { 
      id: '2', 
      title: 'Calm Mind', 
      duration: 10, 
      description: 'Reduce anxiety and find your center',
      icon: 'water-outline' 
    },
    { 
      id: '3', 
      title: 'Deep Relaxation', 
      duration: 15, 
      description: 'Release tension and deeply relax',
      icon: 'leaf-outline' 
    },
    { 
      id: '4', 
      title: 'Mindful Breathing', 
      duration: 20, 
      description: 'Connect with your breath and present moment',
      icon: 'cloud-outline'
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const handleSessionSelect = (duration: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate('Meditation' as never, { duration } as never);
  };

  const navigateToSettings = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate('Settings' as never);
  };

  const navigateToStats = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate('Stats' as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Animated.Text 
          style={[
            styles.title, 
            { 
              color: colors.text,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          Serenity
        </Animated.Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={navigateToStats}
          >
            <Ionicons name="bar-chart-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={navigateToSettings}
          >
            <Ionicons name="settings-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View 
        style={[
          styles.welcomeSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Welcome to your meditation space
        </Text>
        <Text style={[styles.subtitleText, { color: colors.subtext }]}>
          Choose a session to begin your practice
        </Text>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.quickStartSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Start</Text>
          <View style={styles.timeButtonsContainer}>
            {[5, 10, 15, 20].map((minutes, index) => (
              <TouchableOpacity 
                key={minutes} 
                style={[
                  styles.timeButton, 
                  { backgroundColor: colors.card }
                ]}
                onPress={() => handleSessionSelect(minutes)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.timeButtonGradient}
                >
                  <Text style={styles.timeButtonText}>{minutes} min</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.sessionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Guided Sessions</Text>
          {meditationSessions.map((session, index) => (
            <MeditationCard 
              key={session.id}
              title={session.title}
              duration={session.duration}
              description={session.description}
              icon={session.icon}
              onPress={() => handleSessionSelect(session.duration)}
              index={index}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 22,
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  quickStartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  timeButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  sessionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
});