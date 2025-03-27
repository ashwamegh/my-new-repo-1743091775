import React, { useRef, useEffect, useState } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { Storage } from '../utils/storage';
import { MeditationSession } from '../utils/database';

const { width } = Dimensions.get('window');

// Helper function to group meditation sessions by day
const groupSessionsByDay = (sessions: MeditationSession[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Initialize data for each day of the week with 0 minutes
  const weekData = days.map(day => ({ day, minutes: 0 }));
  
  // Calculate the date for the start of the week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Process each session
  sessions.forEach(session => {
    const sessionDate = new Date(session.date);
    
    // Only include sessions from the current week
    if (sessionDate >= startOfWeek) {
      const dayIndex = sessionDate.getDay();
      weekData[dayIndex].minutes += Math.floor(session.duration / 60); // Convert seconds to minutes
    }
  });
  
  // Reorder to start with Monday
  const mondayIndex = days.indexOf('Mon');
  return [...weekData.slice(mondayIndex), ...weekData.slice(0, mondayIndex)];
};

// Helper function to calculate current streak
const calculateStreak = (sessions: MeditationSession[]) => {
  if (sessions.length === 0) return 0;
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if there's a session today
  const latestSessionDate = new Date(sortedSessions[0].date);
  latestSessionDate.setHours(0, 0, 0, 0);
  
  // If no session today, no streak
  if (latestSessionDate.getTime() !== today.getTime() &&
      latestSessionDate.getTime() !== today.getTime() - 86400000) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = latestSessionDate;
  
  // Go through previous days
  for (let i = 1; i < sortedSessions.length; i++) {
    const prevDate = new Date(sortedSessions[i].date);
    prevDate.setHours(0, 0, 0, 0);
    
    // Check if this session is from the previous day
    const expectedPrevDate = new Date(currentDate);
    expectedPrevDate.setDate(currentDate.getDate() - 1);
    
    if (prevDate.getTime() === expectedPrevDate.getTime()) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return streak;
};

export default function StatsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [meditationData, setMeditationData] = useState<{ day: string; minutes: number }[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    const fetchMeditationData = async () => {
      try {
        // Get meditation history from storage
        const sessions = await Storage.getMeditationHistory();
        
        // Process data for the chart
        const weekData = groupSessionsByDay(sessions);
        setMeditationData(weekData);
        
        // Calculate total minutes
        const minutes = sessions.reduce((total, session) => 
          total + Math.floor(session.duration / 60), 0);
        setTotalMinutes(minutes);
        
        // Calculate sessions completed
        setSessionsCompleted(sessions.filter(s => s.completed).length);
        
        // Calculate streak
        setStreak(calculateStreak(sessions));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meditation data', error);
        setLoading(false);
      }
    };
    
    fetchMeditationData();
  }, []);
  
  useEffect(() => {
    if (!loading) {
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
    }
  }, [fadeAnim, slideAnim, loading]);

  const maxMinutes = Math.max(...meditationData.map(d => d.minutes), 1);

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
        <Text style={[styles.title, { color: colors.text }]}>Your Progress</Text>
        <View style={{ width: 28 }} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.statsCards,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={styles.statsIconContainer}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statsValue, { color: colors.text }]}>{totalMinutes}</Text>
            <Text style={[styles.statsLabel, { color: colors.subtext }]}>Minutes</Text>
          </View>
          
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={styles.statsIconContainer}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statsValue, { color: colors.text }]}>{sessionsCompleted}</Text>
            <Text style={[styles.statsLabel, { color: colors.subtext }]}>Sessions</Text>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.chartSection,
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
          
          <View style={styles.chartContainer}>
            <View style={styles.barContainer}>
              {meditationData.map((data, index) => (
                <View key={index} style={styles.barItem}>
                  <View 
                    style={[
                      styles.barWrapper, 
                      { backgroundColor: colors.card }
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.bar,
                        {
                          height: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, (data.minutes / maxMinutes) * 150],
                          }),
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.accent]}
                        style={styles.barGradient}
                      />
                    </Animated.View>
                  </View>
                  <Text style={[styles.barLabel, { color: colors.subtext }]}>{data.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.streakSection,
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Streak</Text>
          
          <View style={[styles.streakCard, { backgroundColor: colors.card }]}>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakValue, { color: colors.text }]}>{streak}</Text>
              <Text style={[styles.streakLabel, { color: colors.subtext }]}>Days in a row</Text>
            </View>
            <View style={styles.streakIconContainer}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.streakIconBackground}
              >
                <Ionicons name="flame" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
          </View>
          
          <Text style={[styles.streakMessage, { color: colors.text }]}>
            {streak > 0 
              ? "Keep going! You're building a great habit."
              : "Complete a meditation session today to start your streak!"}
          </Text>
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
  statsCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statsCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsIconContainer: {
    marginBottom: 10,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginBottom: 5,
  },
  statsLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Inter_700Bold',
  },
  chartContainer: {
    marginTop: 10,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    height: 200,
  },
  barItem: {
    alignItems: 'center',
    width: (width - 40) / 7,
  },
  barWrapper: {
    height: 150,
    width: 10,
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barGradient: {
    flex: 1,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  streakSection: {
    paddingHorizontal: 20,
  },
  streakCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 15,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  streakIconContainer: {
    marginLeft: 10,
  },
  streakIconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakMessage: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 10,
  },
});