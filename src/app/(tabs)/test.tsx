import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { useSettings } from '@/lib/hooks/useSettings';
import DelayScreenSelector from '@/components/DelayScreenSelector';

export default function TestScreen() {
  const colorScheme = useColorScheme();
  const { settings, updateSettings } = useSettings();
  const [showTestScreen, setShowTestScreen] = useState(false);
  
  // Pure black and white color scheme
  const colors = {
    background: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    border: colorScheme === 'dark' ? '#333333' : '#CCCCCC',
  };

  const handleTestComplete = () => {
    setShowTestScreen(false);
    alert('Test completed successfully!');
  };

  const handleTestCancel = () => {
    setShowTestScreen(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Show delay screen if initiated */}
      {showTestScreen && (
        <DelayScreenSelector
          appName="Test App"
          delayTime={settings.defaultDelayTime}
          onComplete={handleTestComplete}
          onCancel={handleTestCancel}
        />
      )}
      
      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Test Screen
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.text }]}>
          Use this screen to test the delay screen functionality.
        </Text>
        
        {/* Toggle for Flashcard Mode */}
        <View style={styles.settingRow}>
          <View style={styles.toggleTextContainer}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Enable Flashcard Quiz Mode
            </Text>
            <Text style={[styles.settingDescription, { color: colors.text }]}>
              Shows a 5-question quiz instead of a breathing exercise.
            </Text>
          </View>
          <Switch
            value={settings.enableFlashcards}
            onValueChange={(value) => updateSettings({ enableFlashcards: value })}
            trackColor={{ false: colors.border, true: colors.text }}
            thumbColor={colors.background}
          />
        </View>
        
        {/* Test Button */}
        <TouchableOpacity
          style={[styles.testButton, { borderColor: colors.text }]}
          onPress={() => setShowTestScreen(true)}
        >
          <Text style={[styles.testButtonText, { color: colors.text }]}>
            {settings.enableFlashcards ? 'Test Flashcard Quiz' : 'Test Breathing Screen'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleTextContainer: {
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
  testButton: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 