import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenTimeModule from '../native/ScreenTimeModule';
import { useSettings } from './useSettings';
import { AppItem, AppCategory, AuthorizationStatus } from '../native/FamilyControlsTypes';

// Storage keys
const SELECTED_APPS_KEY = 'peakfocus_selected_apps';
const APP_TOKENS_KEY = 'peakfocus_app_tokens';

export function useScreenTime() {
  const { settings } = useSettings();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedApps, setSelectedApps] = useState<AppItem[]>([]);
  const [appTokens, setAppTokens] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  // Check if we're on iOS (ScreenTime API is iOS-only)
  const isIOS = Platform.OS === 'ios';

  // Check initial authorization status
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!isIOS) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const status = await ScreenTimeModule.getAuthorizationStatus();
        setIsAuthorized(status.isAuthorized);
        
        // Load saved app tokens if authorized
        if (status.isAuthorized) {
          await loadSavedAppTokens();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthorization();
  }, [isIOS]);

  // Load saved app tokens from AsyncStorage
  const loadSavedAppTokens = async () => {
    try {
      const savedTokensJson = await AsyncStorage.getItem(APP_TOKENS_KEY);
      if (savedTokensJson) {
        const savedTokens = JSON.parse(savedTokensJson);
        setAppTokens(savedTokens);
      }

      const savedAppsJson = await AsyncStorage.getItem(SELECTED_APPS_KEY);
      if (savedAppsJson) {
        const savedApps = JSON.parse(savedAppsJson);
        setSelectedApps(savedApps);
      }
    } catch (err) {
      console.error('Failed to load saved app tokens:', err);
    }
  };

  // Save app tokens to AsyncStorage
  const saveAppTokens = async (tokens: string[], apps: AppItem[]) => {
    try {
      await AsyncStorage.setItem(APP_TOKENS_KEY, JSON.stringify(tokens));
      await AsyncStorage.setItem(SELECTED_APPS_KEY, JSON.stringify(apps));
    } catch (err) {
      console.error('Failed to save app tokens:', err);
    }
  };

  // Request authorization
  const requestAuthorization = useCallback(async (): Promise<AuthorizationStatus> => {
    if (!isIOS) {
      return { isAuthorized: false, error: 'ScreenTime API is only available on iOS' };
    }

    try {
      const status = await ScreenTimeModule.requestAuthorization();
      setIsAuthorized(status.isAuthorized);
      return status;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      return { isAuthorized: false, error: errorMsg };
    }
  }, [isIOS]);

  // Show app selection dialog
  const showAppSelectionDialog = useCallback(async () => {
    if (!isIOS || !isAuthorized) {
      return { selectedApps: [], selectedCategories: [] };
    }

    try {
      const result = await ScreenTimeModule.showAppSelectionDialog();
      
      // Save the selected app tokens
      if (result.selectedApps.length > 0) {
        const tokens = result.selectedApps.map(app => app.bundleId);
        setAppTokens(tokens);
        setSelectedApps(result.selectedApps);
        await saveAppTokens(tokens, result.selectedApps);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      return { selectedApps: [], selectedCategories: [] };
    }
  }, [isIOS, isAuthorized]);

  // Start monitoring selected apps
  const startMonitoring = useCallback(async () => {
    if (!isIOS || !isAuthorized || appTokens.length === 0) {
      return false;
    }

    try {
      // Add shields to the selected apps
      const result = await ScreenTimeModule.addShieldToApps(appTokens);
      
      // Set up app launch listener
      await ScreenTimeModule.addAppLaunchListener();
      
      setIsMonitoring(true);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      return false;
    }
  }, [isIOS, isAuthorized, appTokens]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    if (!isIOS || !isAuthorized) {
      return false;
    }

    try {
      // Remove shields from all apps
      const result = await ScreenTimeModule.removeShieldFromApps(appTokens);
      
      // Remove app launch listener
      await ScreenTimeModule.removeAppLaunchListener();
      
      setIsMonitoring(false);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      return false;
    }
  }, [isIOS, isAuthorized, appTokens]);

  // Get app usage data
  const getAppUsageData = useCallback(async (startDate: Date, endDate: Date) => {
    if (!isIOS || !isAuthorized) {
      return null;
    }

    try {
      return await ScreenTimeModule.getAppUsageData(
        startDate.toISOString(),
        endDate.toISOString()
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      return null;
    }
  }, [isIOS, isAuthorized]);

  return {
    isAuthorized,
    isLoading,
    error,
    selectedApps,
    appTokens,
    isMonitoring,
    requestAuthorization,
    showAppSelectionDialog,
    startMonitoring,
    stopMonitoring,
    getAppUsageData
  };
} 