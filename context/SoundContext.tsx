import React, { createContext, useState, useContext, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Storage } from '../utils/storage';
import { Analytics } from '../utils/analytics';

interface Sound {
  id: string;
  name: string;
  source: any;
  icon: string;
}

interface SoundContextType {
  sounds: Sound[];
  currentSound: Sound | null;
  isPlaying: boolean;
  selectSound: (id: string) => void;
  toggleSound: () => void;
}

const sounds: Sound[] = [
  {
    id: 'rain',
    name: 'Rain',
    source: require('../assets/sounds/rain.mp3'),
    icon: 'rainy-outline',
  },
  {
    id: 'forest',
    name: 'Forest',
    source: require('../assets/sounds/forest.mp3'),
    icon: 'leaf-outline',
  },
  {
    id: 'wave',
    name: 'Ocean Waves',
    source: require('../assets/sounds/wave.mp3'),
    icon: 'water-outline',
  },
];

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioConfigured, setIsAudioConfigured] = useState(false);

  // Configure audio session
  useEffect(() => {
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        setIsAudioConfigured(true);
      } catch (error) {
        console.error('Failed to configure audio mode', error);
      }
    }
    
    configureAudio();
  }, []);

  // Load last used sound from storage
  useEffect(() => {
    async function loadSavedSound() {
      if (!isAudioConfigured) return;
      
      try {
        const lastSoundId = await Storage.getLastUsedSound();
        if (lastSoundId) {
          const savedSound = sounds.find(s => s.id === lastSoundId);
          if (savedSound) {
            setCurrentSound(savedSound);
            // Don't auto-play when app first loads
          }
        }
      } catch (error) {
        console.error('Failed to load saved sound', error);
      }
    }
    
    loadSavedSound();
  }, [isAudioConfigured]);

  // Unload sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [sound]);

  const selectSound = async (id: string) => {
    // Find the selected sound
    const selectedSound = sounds.find((s) => s.id === id);
    if (!selectedSound) return;

    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(console.error);
    }

    // Unload previous sound if exists
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound', error);
      }
      setSound(null);
      setIsPlaying(false);
    }

    setCurrentSound(selectedSound);
    
    // Log analytics event
    Analytics.logEvent('sound_selected', { sound_id: id });
    
    // Save selection to storage
    Storage.setLastUsedSound(id).catch(console.error);

    // Load and play the new sound
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        selectedSound.source,
        { isLooping: true, volume: 1.0 }
      );
      setSound(newSound);
      
      // Auto-play when selecting a new sound
      await newSound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading sound', error);
    }
  };

  const toggleSound = async () => {
    if (!sound) return;

    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(console.error);
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling sound', error);
    }
  };

  return (
    <SoundContext.Provider
      value={{
        sounds,
        currentSound,
        isPlaying,
        selectSound,
        toggleSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSounds() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSounds must be used within a SoundProvider');
  }
  return context;
}