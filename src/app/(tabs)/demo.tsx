import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DelayScreenSelector from '@/components/DelayScreenSelector';
import { useSettings } from '@/lib/hooks/useSettings';
import { useColorScheme } from '@/components/useColorScheme';

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

export default function DemoScreen() {
  const colorScheme = useColorScheme();
  const { settings, updateSettings } = useSettings();
  const [showDelayScreen, setShowDelayScreen] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');
  
  // Pure black and white color scheme
  const colors = {
    background: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    border: colorScheme === 'dark' ? '#333333' : '#CCCCCC',
  };

  const handleAppPress = (appName: string) => {
    setSelectedApp(appName);
    setShowDelayScreen(true);
  };

  const handleDelayComplete = () => {
    // In a real app, this would launch the app or navigate to it
    setShowDelayScreen(false);
    alert(`Redirecting to ${selectedApp}...`);
  };

  const handleDelayCancel = () => {
    setShowDelayScreen(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Show delay screen if initiated */}
      {showDelayScreen && (
        <DelayScreenSelector
          appName={selectedApp}
          delayTime={settings.defaultDelayTime}
          onComplete={handleDelayComplete}
          onCancel={handleDelayCancel}
        />
      )}
      
      <Text style={[styles.headerTitle, { color: colors.text }]}>DELAY SCREEN DEMO</Text>
      
      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          App Access Settings
        </Text>
        
        {/* Toggle for Flashcard Mode */}
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Enable Flashcard Quiz Mode
            </Text>
            <Text style={[styles.settingDescription, { color: colors.text }]}>
              Instead of a breathing exercise, complete a 5-question quiz to access apps immediately.
            </Text>
          </View>
          <Switch
            value={settings.enableFlashcards}
            onValueChange={(value) => updateSettings({ enableFlashcards: value })}
            trackColor={{ false: colors.border, true: colors.text }}
            thumbColor={colors.background}
          />
        </View>
        
        {/* Info box explaining the two modes */}
        <View style={[styles.infoBox, { borderColor: colors.border }]}>
          {settings.enableFlashcards ? (
            <Text style={[styles.infoText, { color: colors.text }]}>
              Flashcard quiz mode is ON. You'll answer 5 questions before accessing an app.
            </Text>
          ) : (
            <Text style={[styles.infoText, { color: colors.text }]}>
              Breathing mode is ON. The breathing screen cannot be bypassed until you've reached your daily focus goal.
            </Text>
          )}
        </View>
      </View>
      
      {/* Apps Section */}
      <View style={styles.appsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Demo Apps
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.text }]}>
          Tap an app to see the delay screen in action
        </Text>
        <View style={styles.appGrid}>
          {popularApps.map((app) => (
            <TouchableOpacity
              key={app.name}
              style={[styles.appButton, { borderColor: colors.border }]}
              onPress={() => handleAppPress(app.name)}
            >
              <Ionicons name={app.icon as any} size={28} color={colors.text} />
              <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  infoBox: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
  },
  appsSection: {
    marginBottom: 40,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  appButton: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
}); 