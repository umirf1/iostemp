import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useScreenTime } from '@/lib/hooks/useScreenTime';
import { useSettings } from '@/lib/hooks/useSettings';
import { router } from 'expo-router';

export default function AppSelectionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { settings } = useSettings();
  
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
  const handleSelectApps = async () => {
    try {
      const result = await showAppSelectionDialog();
      if (result.selectedApps.length > 0) {
        Alert.alert(
          "Apps Selected",
          `You've selected ${result.selectedApps.length} apps to monitor.`,
          [
            {
              text: "OK",
              onPress: () => {}
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert("Error", "Failed to select apps. Please try again.");
      console.error("Error selecting apps:", err);
    }
  };

  // Toggle monitoring
  const toggleMonitoring = async () => {
    try {
      if (isMonitoring) {
        await stopMonitoring();
        Alert.alert("Monitoring Stopped", "App monitoring has been disabled.");
      } else {
        if (selectedApps.length === 0) {
          Alert.alert(
            "No Apps Selected",
            "Please select apps to monitor first.",
            [
              {
                text: "Select Apps",
                onPress: handleSelectApps
              },
              {
                text: "Cancel",
                style: "cancel"
              }
            ]
          );
          return;
        }
        
        const result = await startMonitoring();
        if (result) {
          Alert.alert(
            "Monitoring Started",
            "PeakFocus will now show a delay screen when you try to open the selected apps."
          );
        } else {
          Alert.alert("Error", "Failed to start monitoring. Please try again.");
        }
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred. Please try again.");
      console.error("Error toggling monitoring:", err);
    }
  };

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>APP SELECTION</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Select Apps to Monitor
          </Text>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Choose which apps you want PeakFocus to monitor. When you try to open these apps, a delay screen will appear for {settings.defaultDelayTime} seconds.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.selectButton, { borderColor: colors.border }]}
          onPress={handleSelectApps}
        >
          <Ionicons name="apps" size={24} color={colors.text} style={styles.selectButtonIcon} />
          <Text style={[styles.selectButtonText, { color: colors.text }]}>
            Select Apps
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>

        {selectedApps.length > 0 && (
          <View style={styles.selectedAppsSection}>
            <Text style={[styles.selectedAppsTitle, { color: colors.text }]}>
              SELECTED APPS ({selectedApps.length})
            </Text>
            <View style={[styles.selectedAppsContainer, { borderColor: colors.border }]}>
              {selectedApps.map((app, index) => (
                <View 
                  key={app.id || index} 
                  style={[
                    styles.selectedAppItem, 
                    index < selectedApps.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                  ]}
                >
                  <Text style={[styles.selectedAppName, { color: colors.text }]}>
                    {app.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.monitoringSection, { borderColor: colors.border }]}>
          <View style={styles.monitoringTextContainer}>
            <Text style={[styles.monitoringTitle, { color: colors.text }]}>
              ENABLE MONITORING
            </Text>
            <Text style={[styles.monitoringDescription, { color: colors.text }]}>
              When enabled, PeakFocus will show a delay screen when you try to open the selected apps.
            </Text>
          </View>
          <Switch
            value={isMonitoring}
            onValueChange={toggleMonitoring}
            trackColor={{ false: colors.switchTrackColor, true: isDark ? '#555555' : '#AAAAAA' }}
            thumbColor={isMonitoring ? colors.primary : colors.switchThumbColor}
            ios_backgroundColor={colors.switchTrackColor}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 22,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
  },
  selectButtonIcon: {
    marginRight: 12,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedAppsSection: {
    marginBottom: 24,
  },
  selectedAppsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  selectedAppsContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedAppItem: {
    padding: 16,
  },
  selectedAppName: {
    fontSize: 16,
    fontWeight: '500',
  },
  monitoringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
  },
  monitoringTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  monitoringTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  monitoringDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  permissionIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
}); 