import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Define database schema
export interface MeditationSession {
  id: string;
  date: string;
  duration: number;
  completed: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime: string | null;
}

// Create a WebDatabase implementation for web platform
class WebDatabase {
  private storage = window.localStorage;
  private dbName = 'natively_app';

  async execute(query: string, params: any[] = []): Promise<any> {
    console.log('Web DB query:', query, params);
    return [];
  }

  async getItem<T>(key: string): Promise<T | null> {
    const value = this.storage.getItem(`${this.dbName}_${key}`);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  }

  async setItem(key: string, value: any): Promise<void> {
    this.storage.setItem(`${this.dbName}_${key}`, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(`${this.dbName}_${key}`);
  }
}

// Native SQLite database implementation
class Database {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase('natively.db');
    this.initDatabase();
  }

  private async initDatabase() {
    // Create tables if they don't exist
    await this.execute(
      `CREATE TABLE IF NOT EXISTS meditation_sessions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        duration INTEGER NOT NULL,
        completed INTEGER NOT NULL
      )`
    );

    await this.execute(
      `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`
    );

    await this.execute(
      `CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`
    );
  }

  async execute(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const result = await this.execute(
        'SELECT value FROM user_preferences WHERE key = ?',
        [key]
      );
      
      if (result.rows.length > 0) {
        return JSON.parse(result.rows.item(0).value) as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting item from database:', error);
      return null;
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    const stringValue = JSON.stringify(value);
    await this.execute(
      'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
      [key, stringValue]
    );
  }

  async removeItem(key: string): Promise<void> {
    await this.execute(
      'DELETE FROM user_preferences WHERE key = ?',
      [key]
    );
  }
}

// Export the appropriate database implementation based on platform
export const DB = Platform.OS === 'web' ? new WebDatabase() : new Database();