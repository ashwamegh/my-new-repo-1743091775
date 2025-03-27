import { Platform } from 'react-native';
import { DB, MeditationSession, AppSettings } from './database';

class StorageService {
  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize default settings if they don't exist
      const settings = await this.getSettings();
      if (!settings) {
        await this.updateSettings({
          darkMode: true,
          notificationsEnabled: false,
          reminderTime: null,
        });
      }
    } catch (error) {
      console.error('Failed to initialize storage service', error);
    }
  }

  // Meditation history methods
  async getMeditationHistory(): Promise<MeditationSession[]> {
    try {
      if (Platform.OS === 'web') {
        const history = await DB.getItem<MeditationSession[]>('meditationHistory');
        return history || [];
      } else {
        const result = await DB.execute(
          'SELECT * FROM meditation_sessions ORDER BY date DESC'
        );
        
        const sessions: MeditationSession[] = [];
        for (let i = 0; i < result.rows.length; i++) {
          const row = result.rows.item(i);
          sessions.push({
            id: row.id,
            date: row.date,
            duration: row.duration,
            completed: Boolean(row.completed),
          });
        }
        return sessions;
      }
    } catch (error) {
      console.error('Failed to get meditation history', error);
      return [];
    }
  }

  async addMeditationSession(session: MeditationSession): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const history = await this.getMeditationHistory();
        history.push(session);
        await DB.setItem('meditationHistory', history);
      } else {
        await DB.execute(
          'INSERT INTO meditation_sessions (id, date, duration, completed) VALUES (?, ?, ?, ?)',
          [session.id, session.date, session.duration, session.completed ? 1 : 0]
        );
      }
    } catch (error) {
      console.error('Failed to add meditation session', error);
    }
  }

  async clearMeditationHistory(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await DB.setItem('meditationHistory', []);
      } else {
        await DB.execute('DELETE FROM meditation_sessions');
      }
    } catch (error) {
      console.error('Failed to clear meditation history', error);
    }
  }

  // Settings methods
  async getSettings(): Promise<AppSettings | null> {
    try {
      if (Platform.OS === 'web') {
        return await DB.getItem<AppSettings>('appSettings');
      } else {
        const result = await DB.execute(
          'SELECT key, value FROM app_settings WHERE key IN (?, ?, ?)',
          ['darkMode', 'notificationsEnabled', 'reminderTime']
        );
        
        if (result.rows.length === 0) {
          return null;
        }

        const settings: Partial<AppSettings> = {
          darkMode: true,
          notificationsEnabled: false,
          reminderTime: null,
        };

        for (let i = 0; i < result.rows.length; i++) {
          const row = result.rows.item(i);
          if (row.key === 'darkMode') {
            settings.darkMode = row.value === 'true';
          } else if (row.key === 'notificationsEnabled') {
            settings.notificationsEnabled = row.value === 'true';
          } else if (row.key === 'reminderTime') {
            settings.reminderTime = row.value;
          }
        }

        return settings as AppSettings;
      }
    } catch (error) {
      console.error('Failed to get settings', error);
      return null;
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const currentSettings = await this.getSettings() || {
          darkMode: true,
          notificationsEnabled: false,
          reminderTime: null,
        };
        await DB.setItem('appSettings', { ...currentSettings, ...settings });
      } else {
        // For each setting, update it in the database
        const entries = Object.entries(settings);
        for (const [key, value] of entries) {
          let stringValue: string;
          
          if (typeof value === 'boolean') {
            stringValue = value.toString();
          } else if (value === null) {
            stringValue = 'null';
          } else {
            stringValue = value as string;
          }
          
          await DB.execute(
            'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
            [key, stringValue]
          );
        }
      }
    } catch (error) {
      console.error('Failed to update settings', error);
    }
  }

  // Sound preference methods
  async getLastUsedSound(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await DB.getItem<string>('lastUsedSound');
      } else {
        const result = await DB.execute(
          'SELECT value FROM user_preferences WHERE key = ?',
          ['lastUsedSound']
        );
        
        if (result.rows.length > 0) {
          return result.rows.item(0).value;
        }
        return null;
      }
    } catch (error) {
      console.error('Failed to get last used sound', error);
      return null;
    }
  }

  async setLastUsedSound(soundId: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await DB.setItem('lastUsedSound', soundId);
      } else {
        await DB.execute(
          'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
          ['lastUsedSound', soundId]
        );
      }
    } catch (error) {
      console.error('Failed to set last used sound', error);
    }
  }
}

export const Storage = new StorageService();