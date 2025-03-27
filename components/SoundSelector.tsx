import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSounds } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

interface SoundSelectorProps {
  onClose: () => void;
}

export default function SoundSelector({ onClose }: SoundSelectorProps) {
  const { sounds, currentSound, selectSound, isPlaying, toggleSound } = useSounds();
  const { colors, isDarkMode } = useTheme();
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);
  
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal transparent animationType="none">
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <BlurView 
          intensity={isDarkMode ? 30 : 50} 
          style={styles.blurContainer} 
          tint={isDarkMode ? "dark" : "light"}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                backgroundColor: colors.card,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.subtext }]} />
            </View>
            
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Ambient Sounds</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.soundsContainer}>
              {sounds.map((sound, index) => {
                const isActive = currentSound?.id === sound.id;
                
                return (
                  <Animated.View
                    key={sound.id}
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        { 
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50 + (index * 10), 0],
                          })
                        }
                      ],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.soundItem,
                        isActive && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => selectSound(sound.id)}
                    >
                      <View style={styles.soundIconContainer}>
                        <Ionicons
                          name={sound.icon}
                          size={24}
                          color={isActive ? '#FFFFFF' : colors.text}
                        />
                      </View>
                      <Text
                        style={[
                          styles.soundName,
                          { color: isActive ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {sound.name}
                      </Text>
                      {isActive && (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[
                  styles.playButton,
                  { backgroundColor: isPlaying ? colors.primary : colors.card, borderColor: colors.border }
                ]}
                onPress={toggleSound}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={isPlaying ? '#FFFFFF' : colors.text}
                />
                <Text 
                  style={[
                    styles.playButtonText,
                    { color: isPlaying ? '#FFFFFF' : colors.text }
                  ]}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  closeButton: {
    padding: 5,
  },
  soundsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  soundIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundName: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Inter_400Regular',
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  playButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
  },
  playButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});