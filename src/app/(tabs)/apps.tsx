import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyControls } from '@/lib/hooks/useFamilyControls';
import { AppItem, AppCategory } from '@/lib/native/FamilyControlsTypes';
import DelayScreen from '@/components/DelayScreen';

export default function AppsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    card: isDark ? '#000000' : '#FFFFFF',
    primary: isDark ? '#FFFFFF' : '#000000',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#FFFFFF' : '#000000',
    switchTrackColor: isDark ? '#333333' : '#E9E9EA',
    switchThumbColor: isDark ? '#FFFFFF' : '#FFFFFF',
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showTestDelayScreen, setShowTestDelayScreen] = useState(false);
  const [testAppName, setTestAppName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Use our Family Controls hook
  const { 
    isAuthorized, 
    isLoading, 
    error, 
    categories, 
    selectedApps,
    requestAuthorization,
    saveSelection,
    toggleApp,
    toggleCategory
  } = useFamilyControls();

  // Request authorization on first load if not authorized
  useEffect(() => {
    if (!isAuthorized && !isLoading) {
      // Show explanation dialog before requesting
      Alert.alert(
        "Screen Time Access Required",
        "PeakFocus needs access to Screen Time to monitor apps and display the delay screen. Would you like to grant permission now?",
        [
          {
            text: "Not Now",
            style: "cancel"
          },
          { 
            text: "Continue", 
            onPress: async () => {
              try {
                const result = await requestAuthorization();
                if (!result.isAuthorized) {
                  Alert.alert(
                    "Permission Denied",
                    "Without Screen Time access, PeakFocus cannot monitor apps or display delay screens. You can enable this later in Settings."
                  );
                }
              } catch (err) {
                console.error("Error requesting authorization:", err);
              }
            }
          }
        ]
      );
    }
  }, [isAuthorized, isLoading, requestAuthorization]);

  // Handle toggle of category expansion
  const toggleCategoryExpansion = useCallback((categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Handle category selection toggle
  const handleCategoryToggle = useCallback((categoryId: string, selected: boolean) => {
    toggleCategory(categoryId, selected);
  }, [toggleCategory]);

  // Handle app selection toggle
  const handleAppToggle = useCallback((appId: string, selected: boolean) => {
    toggleApp(appId, selected);
  }, [toggleApp]);

  // Save selected apps and categories
  const handleSaveSelection = useCallback(async () => {
    try {
      // Extract IDs of selected categories and apps
      const selectedCategoryIds = categories
        .filter(cat => cat.isSelected)
        .map(cat => cat.id);
      
      const selectedAppIds = categories
        .flatMap(cat => cat.apps)
        .filter(app => app.isControlled)
        .map(app => app.id);
      
      await saveSelection(selectedCategoryIds, selectedAppIds);
      Alert.alert("Success", "Your app selections have been saved.");
    } catch (err) {
      Alert.alert("Error", "Failed to save your selections. Please try again.");
      console.error("Error saving selection:", err);
    }
  }, [categories, saveSelection]);

  // Filter categories based on search
  const filteredCategories = useCallback(() => {
    if (!searchQuery.trim()) return categories;
    
    return categories.map(category => {
      // Filter apps within this category
      const filteredApps = category.apps.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Only include this category if it has matching apps
      if (filteredApps.length > 0) {
        return {
          ...category,
          apps: filteredApps
        };
      }
      return null;
    }).filter(Boolean) as AppCategory[];
  }, [categories, searchQuery]);

  // Count selected apps
  const selectedAppCount = selectedApps.length;

  // Render category with apps
  const renderCategory = ({ item }: { item: AppCategory }) => {
    const isExpanded = expandedCategories[item.id] || false;
    
    return (
      <View style={styles.categoryContainer}>
        {/* Category header */}
        <TouchableOpacity 
          style={[styles.categoryHeader, { borderBottomColor: colors.border }]}
          onPress={() => toggleCategoryExpansion(item.id)}
        >
          <View style={styles.categoryTitleContainer}>
            <View style={[styles.categoryIcon, { borderColor: colors.border }]}>
              <Ionicons name={item.icon as any} size={20} color={colors.text} />
            </View>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>
              {item.name}
            </Text>
          </View>
          
          <View style={styles.categoryRightContainer}>
            <Switch
              value={item.isSelected}
              onValueChange={(value) => handleCategoryToggle(item.id, value)}
              trackColor={{ false: colors.switchTrackColor, true: isDark ? '#555555' : '#AAAAAA' }}
              thumbColor={item.isSelected ? colors.primary : colors.switchThumbColor}
              ios_backgroundColor={colors.switchTrackColor}
            />
            <Ionicons 
              name={isExpanded ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color={colors.text}
              style={styles.chevron}
            />
          </View>
        </TouchableOpacity>
        
        {/* Apps within this category */}
        {isExpanded && (
          <View style={styles.appsContainer}>
            {item.apps.map(app => (
              <View 
                key={app.id} 
                style={[styles.appItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.appInfo}>
                  <View style={[styles.appIconContainer, { borderColor: colors.border }]}>
                    <Ionicons name={app.icon as any || "apps"} size={18} color={colors.text} />
                  </View>
                  <View style={styles.appDetails}>
                    <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
                    {app.isControlled && (
                      <TouchableOpacity 
                        onPress={() => {
                          setTestAppName(app.name);
                          setShowTestDelayScreen(true);
                        }}
                      >
                        <Text style={[styles.appDelay, { color: colors.text }]}>
                          30 sec delay (tap to test)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Switch
                  value={app.isControlled}
                  onValueChange={(value) => handleAppToggle(app.id, value)}
                  trackColor={{ false: colors.switchTrackColor, true: isDark ? '#555555' : '#AAAAAA' }}
                  thumbColor={app.isControlled ? colors.primary : colors.switchThumbColor}
                  ios_backgroundColor={colors.switchTrackColor}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading apps...
        </Text>
      </View>
    );
  }

  // Show permission request if not authorized
  if (!isAuthorized) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="lock-closed" size={60} color={colors.text} style={styles.permissionIcon} />
        <Text style={[styles.permissionTitle, { color: colors.text }]}>
          Screen Time Access Required
        </Text>
        <Text style={[styles.permissionText, { color: colors.text }]}>
          PeakFocus needs access to Screen Time to monitor your app usage and display delay screens.
        </Text>
        <TouchableOpacity 
          style={[styles.permissionButton, { borderColor: colors.text }]}
          onPress={requestAuthorization}
        >
          <Text style={[styles.permissionButtonText, { color: colors.text }]}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Text style={[styles.headerTitle, { color: colors.text }]}>CONTROLLED APPS</Text>
      <Text style={[styles.headerSubtitle, { color: colors.text }]}>
        Select apps to apply delay screens
      </Text>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.text} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search apps..."
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Apps Counter */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ACTIVE ({selectedAppCount})
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.text }]}>
          These apps will show a delay screen when opened
        </Text>
      </View>

      {/* Categories List */}
      <FlatList
        data={filteredCategories()}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? "No matching apps found." : "No app categories available."}
            </Text>
          </View>
        }
      />

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSaveSelection}
      >
        <Text style={[styles.saveButtonText, { color: colors.background }]}>
          Save Changes
        </Text>
      </TouchableOpacity>

      {/* Test Delay Screen Modal */}
      <Modal
        visible={showTestDelayScreen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <DelayScreen
          appName={testAppName}
          delayTime={30}
          onComplete={() => setShowTestDelayScreen(false)}
          onCancel={() => setShowTestDelayScreen(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '400',
  },
  listContainer: {
    paddingBottom: 80,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 8,
  },
  appsContainer: {
    paddingLeft: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 32,
    height: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appDetails: {
    justifyContent: 'center',
  },
  appName: {
    fontSize: 15,
    fontWeight: '500',
  },
  appDelay: {
    fontSize: 13,
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderRadius: 30,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
}); 