import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface MeditationCardProps {
  title: string;
  duration: number;
  description: string;
  icon: string;
  onPress: () => void;
  index: number;
}

export default function MeditationCard({ 
  title, 
  duration, 
  description, 
  icon, 
  onPress, 
  index 
}: MeditationCardProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Staggered animation based on index
    const delay = 100 + (index * 100);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.iconContainer}
        >
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.subtext }]}>{description}</Text>
          <Text style={[styles.duration, { color: colors.primary }]}>{duration} min</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  duration: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  arrowContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});