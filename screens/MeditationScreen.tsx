import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSounds } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';
import SoundSelector from '../components/SoundSelector';
import BreathingAnimation from '../components/BreathingAnimation';
import { Storage } from '../utils/storage';
import { Analytics } from '../utils/analytics';

const { width } = Dimensions.get('window');

export default function MeditationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { duration = 5 } = route.params as { duration: number };
  const { colors } = useTheme();
  
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSoundSelector, setShowSoundSelector] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const { currentSound, isPlaying, toggleSound } = useSounds();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isActive && !isCompleted) {
          // Show confirmation dialog before exiting a session
          // This is just a placeholder as we don't have a dialog component
          return true; // Prevent default behavior
        }
        return false; // Let default behavior happen
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isActive, isCompleted])
  );

  // Entry animations
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
    ]).start();

    // Create a unique session ID
    setSessionId(`session_${Date.now()}`);
    
    // Log screen view
    Analytics.logScreen('Meditation');
  }, [fadeAnim, slideAnim]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !isCompleted && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      
      // Log completed session
      const completedSession = {
        id: sessionId,
        date: new Date().toISOString(),
        duration: duration,
        completed: true,
      };
      
      Storage.addMeditationSession(completedSession).catch(console.error);
      Analytics.logEvent('session_completed', { duration });
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(console.error);
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, isCompleted, duration, sessionId]);

  const toggleTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(console.error);
    }
    
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    
    if (newIsActive && !isPlaying && currentSound) {
      toggleSound();
    }
    
    if (newIsActive) {
      Analytics.logEvent('session_started', { duration });
    }
  };

  const resetTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(console.error);
    }
    setIsActive(false);
    setTimeRemaining(duration * 60);
    setIsCompleted(false);
    
    // Create a new session ID for the reset session
    setSessionId(`session_${Date.now()}`);
  };

  const handleBackPress = () => {
    if (isActive && !isCompleted) {
      // In a real app, you might want to show a confirmation dialog here
      setIsActive(false);
      
      // Log incomplete session
      const incompleteSession = {
        id: sessionId,
        date: new Date().toISOString(),
        duration: duration,
        completed: false,
      };
      
      Storage.addMeditationSession(incompleteSession).catch(console.error);
    }
    
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.background}
      />
      
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          onPress={handleBackPress} 
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {duration} Minute Meditation
        </Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <View style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.timerContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }]
            }
          ]}
        >
          <BreathingAnimation isActive={isActive} isCompleted={isCompleted} />
          <View style={styles.timeTextContainer}>
            <Text 
              style={[styles.timeText, { color: colors.text }]}
              accessibilityLabel={`${formatTime(timeRemaining)} remaining`}
            >
              {formatTime(timeRemaining)}
            </Text>
            <Text style={[styles.breatheText, { color: colors.subtext }]}>
              {isCompleted ? 'Completed' : isActive ? 'Breathe' : 'Ready'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.controlsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.resetButton, { backgroundColor: colors.card }]} 
            onPress={resetTimer}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
          >
            <Ionicons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={toggleTimer}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isActive ? "Pause meditation" : "Start meditation"}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.playButtonGradient}
            >
              <Ionicons 
                name={isActive ? "pause" : "play"} 
                size={32} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.soundButton, { backgroundColor: colors.card }]} 
            onPress={() => setShowSoundSelector(!showSoundSelector)}
            accessibilityRole="button"
            accessibilityLabel="Select background sound"
          >
            <Ionicons 
              name={isPlaying ? "volume-high" : "volume-mute"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </Animated.View>

        {isCompleted && (
          <Animated.View 
            style={[
              styles.completedMessage,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={[styles.completedText, { color: colors.text }]}>
              Great job! You've completed your meditation session.
            </Text>
            <TouchableOpacity 
              style={[styles.homeButton, { backgroundColor: colors.card }]}
              onPress={handleBackPress}
              accessibilityRole="button"
              accessibilityLabel="Return to home screen"
            >
              <Text style={[styles.homeButtonText, { color: colors.primary }]}>
                Return Home
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {showSoundSelector && (
          <SoundSelector onClose={() => setShowSoundSelector(false)} />
        )}
      </View>
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
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  placeholder: {
    width: 38,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  timeTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  breatheText: {
    fontSize: 18,
    opacity: 0.8,
    fontFamily: 'Inter_400Regular',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedMessage: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
});