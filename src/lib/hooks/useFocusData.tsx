import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from './useSettings';

// Define the focus data interface
interface FocusSession {
  id: string;
  date: string; // ISO string
  duration: number; // in seconds
  completed: boolean;
}

interface DailyFocus {
  date: string; // YYYY-MM-DD format
  totalSeconds: number;
  sessions: FocusSession[];
}

interface FocusData {
  dailyFocus: Record<string, DailyFocus>;
  currentStreak: number;
  longestStreak: number;
}

// Define the context interface
interface FocusDataContextType {
  focusData: FocusData;
  todaysFocusTime: number; // in seconds
  addFocusSession: (duration: number) => Promise<void>;
  resetTodaysFocus: () => Promise<void>;
  isLoading: boolean;
}

// Create the context with default values
const FocusDataContext = createContext<FocusDataContextType>({
  focusData: {
    dailyFocus: {},
    currentStreak: 0,
    longestStreak: 0,
  },
  todaysFocusTime: 0,
  addFocusSession: async () => {},
  resetTodaysFocus: async () => {},
  isLoading: true,
});

// Storage key
const FOCUS_DATA_STORAGE_KEY = 'peakfocus_focus_data';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Provider component
export const FocusDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [focusData, setFocusData] = useState<FocusData>({
    dailyFocus: {},
    currentStreak: 0,
    longestStreak: 0,
  });
  const [todaysFocusTime, setTodaysFocusTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load focus data from storage on mount
  useEffect(() => {
    const loadFocusData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(FOCUS_DATA_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData) as FocusData;
          setFocusData(parsedData);
          
          // Set today's focus time
          const today = getTodayDateString();
          if (parsedData.dailyFocus[today]) {
            setTodaysFocusTime(parsedData.dailyFocus[today].totalSeconds);
          } else {
            setTodaysFocusTime(0);
          }
        }
      } catch (error) {
        console.error('Failed to load focus data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFocusData();
  }, []);

  // Save focus data to storage
  const saveFocusData = async (data: FocusData) => {
    try {
      await AsyncStorage.setItem(FOCUS_DATA_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save focus data:', error);
    }
  };

  // Calculate streak
  const calculateStreak = (dailyFocus: Record<string, DailyFocus>) => {
    const today = getTodayDateString();
    const dailyGoalInSeconds = settings.dailyFocusTarget * 60;
    
    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(dailyFocus)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (sortedDates.length === 0) return 0;
    
    let currentStreak = 0;
    let currentDate = new Date(today);
    
    // Check if today's goal is met
    if (dailyFocus[today] && dailyFocus[today].totalSeconds >= dailyGoalInSeconds) {
      currentStreak = 1;
    } else if (sortedDates[0] !== today) {
      // If today is not in the record and we don't have today's data yet, 
      // start checking from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Convert to YYYY-MM-DD format
    let dateToCheck = currentDate.toISOString().split('T')[0];
    
    // Start checking consecutive days
    while (true) {
      // If this date is not in our records, break the streak
      if (!dailyFocus[dateToCheck]) break;
      
      // If this date didn't meet the goal, break the streak
      if (dailyFocus[dateToCheck].totalSeconds < dailyGoalInSeconds) break;
      
      // If we're checking today and it's already counted, skip incrementing
      if (dateToCheck !== today || currentStreak === 0) {
        currentStreak++;
      }
      
      // Move to the previous day
      currentDate.setDate(currentDate.getDate() - 1);
      dateToCheck = currentDate.toISOString().split('T')[0];
    }
    
    return currentStreak;
  };

  // Add a new focus session
  const addFocusSession = async (duration: number) => {
    const today = getTodayDateString();
    const newSession: FocusSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration,
      completed: true,
    };
    
    const updatedFocusData = { ...focusData };
    
    // Initialize today's data if it doesn't exist
    if (!updatedFocusData.dailyFocus[today]) {
      updatedFocusData.dailyFocus[today] = {
        date: today,
        totalSeconds: 0,
        sessions: [],
      };
    }
    
    // Add the session and update total time
    updatedFocusData.dailyFocus[today].sessions.push(newSession);
    updatedFocusData.dailyFocus[today].totalSeconds += duration;
    
    // Update today's focus time state
    const newTodaysFocusTime = updatedFocusData.dailyFocus[today].totalSeconds;
    setTodaysFocusTime(newTodaysFocusTime);
    
    // Calculate current streak
    const currentStreak = calculateStreak(updatedFocusData.dailyFocus);
    updatedFocusData.currentStreak = currentStreak;
    
    // Update longest streak if needed
    if (currentStreak > updatedFocusData.longestStreak) {
      updatedFocusData.longestStreak = currentStreak;
    }
    
    // Save updated data
    setFocusData(updatedFocusData);
    await saveFocusData(updatedFocusData);
  };

  // Reset today's focus data
  const resetTodaysFocus = async () => {
    const today = getTodayDateString();
    const updatedFocusData = { ...focusData };
    
    if (updatedFocusData.dailyFocus[today]) {
      updatedFocusData.dailyFocus[today].totalSeconds = 0;
      updatedFocusData.dailyFocus[today].sessions = [];
      
      setTodaysFocusTime(0);
      setFocusData(updatedFocusData);
      await saveFocusData(updatedFocusData);
    }
  };

  return (
    <FocusDataContext.Provider 
      value={{ 
        focusData, 
        todaysFocusTime, 
        addFocusSession, 
        resetTodaysFocus, 
        isLoading 
      }}
    >
      {children}
    </FocusDataContext.Provider>
  );
};

// Custom hook to use the focus data context
export const useFocusData = () => useContext(FocusDataContext); 