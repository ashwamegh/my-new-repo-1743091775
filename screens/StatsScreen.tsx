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
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Simulated meditation data
  const meditationData = [
    { day: 'Mon', minutes: 10 },
    { day: 'Tue', minutes: 15 },
    { day: 'Wed', minutes: 5 },
    { day: 'Thu', minutes: 20 },
    { day: 'Fri', minutes: 10 },
    { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 15 },
  ];
  
  const totalMinutes = meditationData.reduce((acc, curr) => acc + curr.minutes, 0);
  const sessionsCompleted = meditationData.filter(d => d.minutes > 0).length;
  const maxMinutes = Math.max(...meditationData.map(d => d.minutes));
  
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
  }, [fadeAnim, slideAnim]);

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
              {meditationData.map((data, index) => {
                // Maps are not supported on web in Natively
                if (Platform.OS === 'web') {
                  return (
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
                  );
                } else {
                  // For iOS and Android, render the same content
                  return (
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
                  );
                }
              })}
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
              <Text style={[styles.streakValue, { color: colors.text }]}>3</Text>
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
            Keep going! You're building a great habit.
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