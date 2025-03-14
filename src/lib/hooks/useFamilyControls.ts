import { useState, useEffect, useCallback } from 'react';
import FamilyControlsModule from '../native/FamilyControlsModule';
import { AppCategory, AppItem, AuthorizationStatus, SelectionResult } from '../native/FamilyControlsTypes';

export function useFamilyControls() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [selectedApps, setSelectedApps] = useState<AppItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<AppCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check initial authorization status
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        setIsLoading(true);
        const status = await FamilyControlsModule.getAuthorizationStatus();
        setIsAuthorized(status.isAuthorized);
        
        if (status.isAuthorized) {
          // Load categories and selection if authorized
          await loadCategories();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthorization();
  }, []);

  // Set up authorization callback
  useEffect(() => {
    // Register for authorization changes
    FamilyControlsModule.setAuthorizationCallback((status) => {
      setIsAuthorized(status.isAuthorized);
    });
    
    // Register for selection changes
    FamilyControlsModule.setSelectionChangeCallback((result) => {
      setSelectedApps(result.selectedApps);
      setSelectedCategories(result.selectedCategories);
    });
    
    // Clean up
    return () => {
      FamilyControlsModule.setAuthorizationCallback(() => {});
      FamilyControlsModule.setSelectionChangeCallback(() => {});
    };
  }, []);

  // Load app categories
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedCategories = await FamilyControlsModule.getAppCategories();
      setCategories(fetchedCategories);
      
      // Extract selected items
      const selectedCats = fetchedCategories.filter(c => c.isSelected);
      const selectedAppItems = fetchedCategories
        .flatMap(c => c.apps)
        .filter(a => a.isControlled);
      
      setSelectedCategories(selectedCats);
      setSelectedApps(selectedAppItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request authorization
  const requestAuthorization = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await FamilyControlsModule.requestAuthorization();
      setIsAuthorized(status.isAuthorized);
      
      if (status.isAuthorized) {
        await loadCategories();
      }
      
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return { isAuthorized: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadCategories]);

  // Save selections
  const saveSelection = useCallback(async (categoryIds: string[], appIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await FamilyControlsModule.saveSelection(categoryIds, appIds);
      setSelectedCategories(result.selectedCategories);
      setSelectedApps(result.selectedApps);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle category selection
  const toggleCategory = useCallback((categoryId: string, selected: boolean) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId 
          ? { ...category, isSelected: selected }
          : category
      )
    );
  }, []);

  // Toggle app selection
  const toggleApp = useCallback((appId: string, selected: boolean) => {
    setCategories(prevCategories => 
      prevCategories.map(category => ({
        ...category,
        apps: category.apps.map(app => 
          app.id === appId 
            ? { ...app, isControlled: selected }
            : app
        )
      }))
    );
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    try {
      return await FamilyControlsModule.startMonitoring();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    }
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    try {
      return await FamilyControlsModule.stopMonitoring();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    }
  }, []);

  return {
    isAuthorized,
    isLoading,
    error,
    categories,
    selectedApps,
    selectedCategories,
    requestAuthorization,
    loadCategories,
    saveSelection,
    toggleCategory,
    toggleApp,
    startMonitoring,
    stopMonitoring
  };
} 