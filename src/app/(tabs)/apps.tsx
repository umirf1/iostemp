import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator, Alert, ScrollView, Modal, TextInput, FlatList } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useScreenTime } from '@/lib/hooks/useScreenTime';
import DelayScreenSelector from '@/components/DelayScreenSelector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '@/lib/hooks/useSettings';

// Storage key for named apps
const NAMED_APPS_KEY = 'peakfocus_named_apps';

// Interface for named app
interface NamedApp {
  id: string;
  name: string;
  token: string;
}

// Array of confirmation phrases for disabling monitoring
const DISABLE_PHRASES = [
  "I am willing to risk losing my focus and falling back into endless scrolling",
  "I recognize that phone addiction can steal my time and attention from what matters",
  "I am okay with letting apps take control over my habits once again",
  "I understand that constant distractions harm my ability to think deeply and stay present",
  "I accept that turning this off might pull me away from my real priorities"
];

const popularApps = [
  { name: 'Instagram', icon: 'logo-instagram' },
  { name: 'Twitter', icon: 'logo-twitter' },
  { name: 'TikTok', icon: 'musical-notes' },
  { name: 'YouTube', icon: 'logo-youtube' },
  { name: 'WhatsApp', icon: 'logo-whatsapp' },
  { name: 'Facebook', icon: 'logo-facebook' },
  { name: 'Netflix', icon: 'play-circle' },
  { name: 'Snapchat', icon: 'logo-snapchat' },
  { name: 'Reddit', icon: 'logo-reddit' },
];

export default function AppsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Get settings from the useSettings hook
  const { settings, updateSettings } = useSettings();
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    card: isDark ? '#1C1C1E' : '#F2F2F7',
    primary: isDark ? '#FFFFFF' : '#000000',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#FFFFFF' : '#000000',
    switchTrackColor: isDark ? '#333333' : '#E9E9EA',
    switchThumbColor: isDark ? '#FFFFFF' : '#FFFFFF',
    switchTrackActiveColor: isDark ? '#555555' : '#AAAAAA',
    caption: isDark ? '#AAAAAA' : '#777777',
    modalBackground: isDark ? '#1C1C1E' : '#FFFFFF',
    error: '#FF3B30',
  };

  const [showTestDelayScreen, setShowTestDelayScreen] = useState(false);
  const [showTestFlashcardScreen, setShowTestFlashcardScreen] = useState(false);
  const [namedApps, setNamedApps] = useState<NamedApp[]>([]);
  const [namingModalVisible, setNamingModalVisible] = useState(false);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [disablePhrase, setDisablePhrase] = useState('');
  const [currentDisablePhrase, setCurrentDisablePhrase] = useState('');
  const [invalidPhrase, setInvalidPhrase] = useState(false);
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [appName, setAppName] = useState('');
  const [mockedSelectedTokens, setMockedSelectedTokens] = useState<string[]>([]);
  // Add a local monitoring state to ensure UI consistency
  const [localMonitoring, setLocalMonitoring] = useState<boolean>(false);
  // Add states for app removal confirmation
  const [removeAppModalVisible, setRemoveAppModalVisible] = useState(false);
  const [removeAppPhrase, setRemoveAppPhrase] = useState('');
  const [currentRemoveAppPhrase, setCurrentRemoveAppPhrase] = useState('');
  const [invalidRemovePhrase, setInvalidRemovePhrase] = useState(false);
  const [appToRemove, setAppToRemove] = useState<string>('');
  
  // Use our ScreenTime hook
  const { 
    isAuthorized, 
    isLoading, 
    error, 
    selectedApps,
    isMonitoring,
    requestAuthorization,
    showAppSelectionDialog,
    startMonitoring,
    stopMonitoring
  } = useScreenTime();

  // Sync local monitoring state with hook state
  useEffect(() => {
    setLocalMonitoring(isMonitoring);
  }, [isMonitoring]);
  
  // Load named apps on initial render
  useEffect(() => {
    loadNamedApps();
  }, []);

  // Load named apps from AsyncStorage
  const loadNamedApps = async () => {
    try {
      const savedAppsJson = await AsyncStorage.getItem(NAMED_APPS_KEY);
      if (savedAppsJson) {
        const savedApps = JSON.parse(savedAppsJson);
        setNamedApps(savedApps);
      }
    } catch (err) {
      console.error('Failed to load named apps:', err);
    }
  };

  // Save named apps to AsyncStorage
  const saveNamedApps = async (apps: NamedApp[]) => {
    try {
      await AsyncStorage.setItem(NAMED_APPS_KEY, JSON.stringify(apps));
    } catch (err) {
      console.error('Failed to save named apps:', err);
    }
  };

  // Get a random disable phrase
  const getRandomDisablePhrase = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * DISABLE_PHRASES.length);
    return DISABLE_PHRASES[randomIndex];
  }, []);

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

  // Handle app selection
  const handleSelectApps = useCallback(async () => {
    try {
      // In a real implementation, this would call the actual ScreenTime API
      // For now, let's simulate the selection by generating random tokens
      
      // First, simulate the Apple selection UI
      Alert.alert(
        "App Selection",
        "This would normally show Apple's app selection UI. For testing, we'll simulate selecting 3 apps.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Select Apps", 
            onPress: () => {
              // Simulate receiving opaque tokens from Apple
              const mockedTokens = [
                `token_${Date.now()}_1`,
                `token_${Date.now()}_2`,
                `token_${Date.now()}_3`,
              ];
              
              setMockedSelectedTokens(mockedTokens);
              
              // Reset the app naming process
              setCurrentAppIndex(0);
              setAppName('');
              
              // Start the app naming process
              setNamingModalVisible(true);
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert("Error", "Failed to show app selection dialog. Please try again.");
      console.error("Error showing app selection dialog:", err);
    }
  }, []);

  // Handle app naming
  const handleNameApp = useCallback(() => {
    if (!appName.trim()) {
      Alert.alert("Error", "Please enter a name for this app.");
      return;
    }
    
    // Create a new named app
    const newNamedApp: NamedApp = {
      id: `app_${Date.now()}_${currentAppIndex}`,
      name: appName.trim(),
      token: mockedSelectedTokens[currentAppIndex],
    };
    
    // Add to named apps list
    const updatedNamedApps = [...namedApps, newNamedApp];
    setNamedApps(updatedNamedApps);
    saveNamedApps(updatedNamedApps);
    
    // Clear the input
    setAppName('');
    
    // Move to the next app or close modal if done
    if (currentAppIndex < mockedSelectedTokens.length - 1) {
      setCurrentAppIndex(currentAppIndex + 1);
    } else {
      setNamingModalVisible(false);
      Alert.alert("Success", `You've added ${mockedSelectedTokens.length} apps to monitor.`);
    }
  }, [appName, currentAppIndex, mockedSelectedTokens, namedApps]);

  // Handle removing a named app
  const handleRemoveApp = useCallback((appId: string) => {
    // Show phrase confirmation modal when trying to remove an app
    const randomPhrase = getRandomDisablePhrase();
    setCurrentRemoveAppPhrase(randomPhrase);
    setRemoveAppPhrase('');
    setInvalidRemovePhrase(false);
    setAppToRemove(appId);
    setRemoveAppModalVisible(true);
  }, [getRandomDisablePhrase]);

  // Handle remove app confirmation
  const handleRemoveAppConfirm = useCallback(async () => {
    if (removeAppPhrase !== currentRemoveAppPhrase) {
      setInvalidRemovePhrase(true);
      return;
    }
    
    try {
      const updatedApps = namedApps.filter(app => app.id !== appToRemove);
      setNamedApps(updatedApps);
      saveNamedApps(updatedApps);
      
      setRemoveAppModalVisible(false);
      Alert.alert("App Removed", "The app has been removed from monitoring.");
    } catch (err) {
      Alert.alert("Error", "Failed to remove app. Please try again.");
      console.error("Error removing app:", err);
    }
  }, [removeAppPhrase, currentRemoveAppPhrase, appToRemove, namedApps, saveNamedApps]);

  // Handle monitoring toggle
  const handleToggleMonitoring = useCallback(async (value: boolean) => {
    try {
      if (value) {
        // Start monitoring
        if (namedApps.length === 0) {
          Alert.alert(
            "No Apps Selected",
            "Please select apps to monitor first.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Select Apps", onPress: handleSelectApps }
            ]
          );
          return;
        }
        
        const success = await startMonitoring();
        
        // Update local state first for immediate UI feedback
        setLocalMonitoring(true);
        
        Alert.alert("Monitoring Started", "Selected apps will now show a delay screen when opened.");
      } else {
        // Show phrase confirmation modal when trying to stop monitoring
        // Select a random phrase for this session
        const randomPhrase = getRandomDisablePhrase();
        setCurrentDisablePhrase(randomPhrase);
        setDisablePhrase('');
        setInvalidPhrase(false);
        setDisableModalVisible(true);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to toggle monitoring. Please try again.");
      console.error("Error toggling monitoring:", err);
    }
  }, [namedApps, startMonitoring, handleSelectApps, getRandomDisablePhrase]);

  // Handle disable confirmation
  const handleDisableConfirm = useCallback(async () => {
    if (disablePhrase !== currentDisablePhrase) {
      setInvalidPhrase(true);
      return;
    }
    
    try {
      await stopMonitoring();
      
      // Update local state first for immediate UI feedback
      setLocalMonitoring(false);
      
      setDisableModalVisible(false);
      Alert.alert("Monitoring Stopped", "Apps will no longer show delay screens.");
    } catch (err) {
      Alert.alert("Error", "Failed to stop monitoring. Please try again.");
      console.error("Error stopping monitoring:", err);
    }
  }, [disablePhrase, currentDisablePhrase, stopMonitoring]);

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading...
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Text style={[styles.headerTitle, { color: colors.text }]}>APP MONITORING</Text>
      <Text style={[styles.headerSubtitle, { color: colors.text }]}>
        Select apps to monitor and show delay screens
      </Text>

      {/* App Selection Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="apps" size={24} color={colors.text} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Select Apps to Monitor</Text>
        </View>
        
        <Text style={[styles.cardDescription, { color: colors.caption }]}>
          Choose which apps to monitor and show delay screens for. Due to Apple's privacy design, 
          you'll need to provide a name for each selected app.
        </Text>
        
        <TouchableOpacity 
          style={[styles.selectButton, { backgroundColor: colors.primary }]}
          onPress={handleSelectApps}
        >
          <Text style={[styles.selectButtonText, { color: colors.background }]}>
            Select Apps
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Apps Card */}
      {namedApps.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={24} color={colors.text} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Selected Apps</Text>
          </View>
          
          <Text style={[styles.cardDescription, { color: colors.caption }]}>
            These apps will show a delay screen when opened.
          </Text>
          
          {namedApps.map((app) => (
            <View key={app.id} style={styles.appItem}>
              <View style={styles.appInfo}>
                <View style={[styles.appIconContainer, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.appIconText, { color: colors.background }]}>
                    {app.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveApp(app.id)}
              >
                <Ionicons name="close-circle" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Monitoring Toggle Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="eye-outline" size={24} color={colors.text} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>App Monitoring</Text>
        </View>
        
        <Text style={[styles.cardDescription, { color: colors.caption }]}>
          When enabled, selected apps will show a delay screen when opened.
          {localMonitoring && " To disable monitoring, you'll need to type a confirmation phrase."}
        </Text>
        
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            Enable Monitoring
          </Text>
          <Switch
            value={localMonitoring}
            onValueChange={handleToggleMonitoring}
            trackColor={{ false: colors.switchTrackColor, true: colors.switchTrackActiveColor }}
            thumbColor={colors.switchThumbColor}
            ios_backgroundColor={colors.switchTrackColor}
          />
        </View>
        
        {/* Flashcard Option Toggle (moved from How It Works section) */}
        <View style={[styles.toggleContainer, { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={{flex: 1}}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              Enable Flashcard Quiz Mode
            </Text>
            <Text style={[styles.toggleDescription, { color: colors.caption }]}>
              When enabled, delay screens will show a 5-question quiz that allows immediate app access when completed
            </Text>
          </View>
          <Switch
            value={settings.enableFlashcardQuiz}
            onValueChange={(value) => updateSettings({ enableFlashcardQuiz: value })}
            trackColor={{ false: colors.switchTrackColor, true: colors.switchTrackActiveColor }}
            thumbColor={colors.switchThumbColor}
            ios_backgroundColor={colors.switchTrackColor}
          />
        </View>
      </View>

      {/* How It Works Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={24} color={colors.text} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>How It Works</Text>
        </View>
        
        <View style={styles.tutorialStep}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={[styles.stepNumberText, { color: colors.background }]}>1</Text>
          </View>
          <Text style={[styles.stepText, { color: colors.text }]}>
            Tap "Select Apps" to choose apps through Apple's selection UI
          </Text>
        </View>
        
        <View style={styles.tutorialStep}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={[styles.stepNumberText, { color: colors.background }]}>2</Text>
          </View>
          <Text style={[styles.stepText, { color: colors.text }]}>
            Name each app you selected (Apple's privacy design prevents us from knowing which apps you chose)
          </Text>
        </View>
        
        <View style={styles.tutorialStep}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={[styles.stepNumberText, { color: colors.background }]}>3</Text>
          </View>
          <Text style={[styles.stepText, { color: colors.text }]}>
            Toggle "Enable Monitoring" to activate delay screens for your selected apps
          </Text>
        </View>
      </View>

      {/* App Naming Modal */}
      <Modal
        visible={namingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNamingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Name This App
            </Text>
            
            <Text style={[styles.modalSubtitle, { color: colors.caption }]}>
              Due to Apple's privacy design, we can't see which app you selected.
              Please provide a name for app {currentAppIndex + 1} of {mockedSelectedTokens.length}.
            </Text>
            
            <View style={[styles.appIconLarge, { backgroundColor: colors.primary }]}>
              <Ionicons name="apps" size={40} color={colors.background} />
            </View>
            
            <Text style={[styles.modalLabel, { color: colors.text }]}>
              What would you like to call this app?
            </Text>
            
            <TextInput
              style={[styles.modalInput, { 
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: isDark ? '#000000' : '#F5F5F5'
              }]}
              placeholder="e.g. Instagram, TikTok, etc."
              placeholderTextColor={colors.caption}
              value={appName}
              onChangeText={setAppName}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleNameApp}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.border }]}
                onPress={() => setNamingModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                onPress={handleNameApp}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  {currentAppIndex < mockedSelectedTokens.length - 1 ? 'Next App' : 'Finish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Disable Monitoring Confirmation Modal */}
      <Modal
        visible={disableModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDisableModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Remove All Delay Screens?
            </Text>
            
            <Text style={[styles.modalLabel, { color: colors.text, marginTop: 8 }]}>
              To confirm, please type:
            </Text>
            
            <Text style={[styles.disablePhrase, { color: colors.primary }]}>
              {currentDisablePhrase}
            </Text>
            
            <TextInput
              style={[
                styles.modalInput, 
                { 
                  color: colors.text,
                  borderColor: invalidPhrase ? colors.error : colors.border,
                  backgroundColor: isDark ? '#000000' : '#F5F5F5'
                }
              ]}
              placeholder="Type the phrase exactly as shown"
              placeholderTextColor={colors.caption}
              value={disablePhrase}
              onChangeText={(text) => {
                setDisablePhrase(text);
                setInvalidPhrase(false);
              }}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleDisableConfirm}
            />
            
            {invalidPhrase && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                The phrase doesn't match exactly. Please try again.
              </Text>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.border }]}
                onPress={() => setDisableModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                onPress={handleDisableConfirm}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Disable
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add the Remove App Confirmation Modal */}
      <Modal
        visible={removeAppModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRemoveAppModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Remove This App?
            </Text>
            
            <Text style={[styles.modalLabel, { color: colors.text, marginTop: 8 }]}>
              To confirm, please type:
            </Text>
            
            <Text style={[styles.disablePhrase, { color: colors.primary }]}>
              {currentRemoveAppPhrase}
            </Text>
            
            <TextInput
              style={[
                styles.modalInput, 
                { 
                  color: colors.text,
                  borderColor: invalidRemovePhrase ? colors.error : colors.border,
                  backgroundColor: isDark ? '#000000' : '#F5F5F5'
                }
              ]}
              placeholder="Type the phrase exactly as shown"
              placeholderTextColor={colors.caption}
              value={removeAppPhrase}
              onChangeText={(text) => {
                setRemoveAppPhrase(text);
                setInvalidRemovePhrase(false);
              }}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleRemoveAppConfirm}
            />
            
            {invalidRemovePhrase && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                The phrase doesn't match exactly. Please try again.
              </Text>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.border }]}
                onPress={() => setRemoveAppModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                onPress={handleRemoveAppConfirm}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Test Delay Screen */}
      {showTestDelayScreen ? (
        <DelayScreenSelector
          appName="App Preview"
          delayTime={10} // Using a shorter time for testing
          onComplete={() => {
            console.log('Delay screen completed, hiding');
            setShowTestDelayScreen(false);
          }}
          onCancel={() => {
            console.log('Delay screen canceled, hiding');
            setShowTestDelayScreen(false);
          }}
        />
      ) : null}

      {/* Test Flashcard Delay Screen */}
      {showTestFlashcardScreen ? (
        <DelayScreenSelector
          appName="App Preview (Flashcard)"
          delayTime={10} // Using a shorter time for testing
          onComplete={() => {
            console.log('Flashcard delay screen completed, hiding');
            setShowTestFlashcardScreen(false);
          }}
          onCancel={() => {
            console.log('Flashcard delay screen canceled, hiding');
            setShowTestFlashcardScreen(false);
          }}
        />
      ) : null}
    </ScrollView>
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
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  selectButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 14,
    flex: 1,
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '500',
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
  },
  // App item styles
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150,150,150,0.3)',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  appIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  disablePhrase: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    marginRight: 8,
    borderWidth: 1,
  },
  modalButtonConfirm: {
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 