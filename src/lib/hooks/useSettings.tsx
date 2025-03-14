import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the settings interface
interface Settings {
  defaultDelayTime: number;
  enableFlashcards: boolean;
  dailyBypassLimit: number;
  dailyUsageGoal: number;
  dailyFocusTarget: number;
  notificationsEnabled: boolean;
  darkMode: boolean;
}

// Define the context interface
interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
}

// Create the context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: {
    defaultDelayTime: 30,
    enableFlashcards: true,
    dailyBypassLimit: 3,
    dailyUsageGoal: 120,
    dailyFocusTarget: 180,
    notificationsEnabled: true,
    darkMode: false,
  },
  updateSettings: async () => {},
  isLoading: true,
});

// Storage key
const SETTINGS_STORAGE_KEY = 'peakfocus_settings';

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    defaultDelayTime: 30,
    enableFlashcards: true,
    dailyBypassLimit: 3,
    dailyUsageGoal: 120,
    dailyFocusTarget: 180,
    notificationsEnabled: true,
    darkMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings function
  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => useContext(SettingsContext); 