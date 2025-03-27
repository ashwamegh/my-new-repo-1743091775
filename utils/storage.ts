import { Platform } from 'react-native';

// This is a simple storage abstraction that could be replaced with
// a more robust solution like AsyncStorage in a real app

type StorageData = {
  meditationHistory: MeditationSession[];
  appSettings: AppSettings;
  lastUsedSound: string | null;
};

type MeditationSession = {
  id: string;
  date: string;
  duration: number;
  completed: boolean;
};

type AppSettings = {
  darkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime: string | null;
};

class StorageService {
  private data: StorageData = {
    meditationHistory: [],
    appSettings: {
      darkMode: true,
      notificationsEnabled: false,
      reminderTime: null,
    },
    lastUsedSound: null,
  };

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // In a real implementation, this would load from AsyncStorage
      if (Platform.OS !== 'web') {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // For web, we can use localStorage
      if (Platform.OS === 'web') {
        const savedData = localStorage.getItem('serenityAppData');
        if (savedData) {
          this.data = JSON.parse(savedData);
        }
      }
    } catch (error) {
      console.error('Failed to load data from storage', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      // In a real implementation, this would save to AsyncStorage
      if (Platform.OS === 'web') {
        localStorage.setItem('serenityAppData', JSON.stringify(this.data));
      }
    } catch (error) {
      console.error('Failed to save data to storage', error);
    }
  }

  // Meditation history methods
  async getMeditationHistory(): Promise<MeditationSession[]> {
    return this.data.meditationHistory;
  }

  async addMeditationSession(session: MeditationSession): Promise<void> {
    this.data.meditationHistory.push(session);
    await this.saveToStorage();
  }

  async clearMeditationHistory(): Promise<void> {
    this.data.meditationHistory = [];
    await this.saveToStorage();
  }

  // Settings methods
  async getSettings(): Promise<AppSettings> {
    return this.data.appSettings;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    this.data.appSettings = { ...this.data.appSettings, ...settings };
    await this.saveToStorage();
  }

  // Sound preference methods
  async getLastUsedSound(): Promise<string | null> {
    return this.data.lastUsedSound;
  }

  async setLastUsedSound(soundId: string): Promise<void> {
    this.data.lastUsedSound = soundId;
    await this.saveToStorage();
  }
}

export const Storage = new StorageService();