import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface BreathingAnimationProps {
  isActive: boolean;
  isCompleted: boolean;
}

export default function BreathingAnimation({ isActive, isCompleted }: BreathingAnimationProps) {
  const { colors } = useTheme();
  
  const breatheAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const completedAnim = useRef(new Animated.Value(0)).current;
  
  const circleSize = width * 0.7;
  
  // Handle the breathing animation
  useEffect(() => {
    if (isActive) {
      // Reset rotation when starting
      rotateAnim.setValue(0);
      
      // Breathing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.2,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0.8,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Slow rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      breatheAnim.stopAnimation();
      rotateAnim.stopAnimation();
    }
  }, [isActive, breatheAnim, rotateAnim]);
  
  // Pulse animation when completed
  useEffect(() => {
    if (isCompleted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      Animated.timing(completedAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      pulseAnim.setValue(1);
      completedAnim.setValue(0);
    }
  }, [isCompleted, pulseAnim, completedAnim]);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <View style={styles.container}>
      {/* Background Circle */}
      <Animated.View 
        style={[
          styles.backgroundCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: isCompleted 
              ? 'rgba(75, 181, 67, 0.2)' 
              : `rgba(${colors.primary.replace(/[^\d,]/g, '')}, 0.2)`,
            borderColor: isCompleted ? '#4BB543' : colors.primary,
            transform: [
              { scale: isCompleted ? pulseAnim : breatheAnim },
            ],
          },
        ]}
      />
      
      {/* Rotating Particles */}
      {!isCompleted && isActive && (
        <Animated.View
          style={[
            styles.particlesContainer,
            {
              width: circleSize * 1.2,
              height: circleSize * 1.2,
              transform: [{ rotate }],
            },
          ]}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: colors.primary,
                  top: i % 2 === 0 ? 0 : undefined,
                  bottom: i % 2 !== 0 ? 0 : undefined,
                  left: i % 4 < 2 ? 0 : undefined,
                  right: i % 4 >= 2 ? 0 : undefined,
                  opacity: 0.6 - (i * 0.05),
                  transform: [
                    { translateX: i % 2 === 0 ? -10 : 10 },
                    { translateY: i % 4 < 2 ? -10 : 10 },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}
      
      {/* Completed Animation Elements */}
      {isCompleted && (
        <>
          <Animated.View
            style={[
              styles.completedRing,
              {
                width: circleSize * 1.3,
                height: circleSize * 1.3,
                borderRadius: (circleSize * 1.3) / 2,
                borderColor: '#4BB543',
                opacity: completedAnim,
                transform: [{ scale: completedAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.completedRing,
              {
                width: circleSize * 1.5,
                height: circleSize * 1.5,
                borderRadius: (circleSize * 1.5) / 2,
                borderColor: '#4BB543',
                opacity: completedAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
                transform: [{ scale: completedAnim }],
              },
            ]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  completedRing: {
    position: 'absolute',
    borderWidth: 1,
  },
});