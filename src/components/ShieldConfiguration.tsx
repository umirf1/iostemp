import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useColorScheme } from './useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/lib/hooks/useSettings';
import ScreenTimeModule from '@/lib/native/ScreenTimeModule';

interface ShieldConfigurationProps {
  onSave: () => void;
}

export default function ShieldConfiguration({ onSave }: ShieldConfigurationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { settings, updateSettings } = useSettings();
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    card: isDark ? '#000000' : '#FFFFFF',
    primary: isDark ? '#FFFFFF' : '#000000',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#FFFFFF' : '#000000',
  };

  // Handle delay time change
  const handleDelayTimeChange = async (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      await updateSettings({ defaultDelayTime: numValue });
    }
  };

  // Toggle flashcards
  const toggleFlashcards = async () => {
    await updateSettings({ enableFlashcards: !settings.enableFlashcards });
  };

  // Handle bypass limit change
  const handleBypassLimitChange = async (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      await updateSettings({ dailyBypassLimit: numValue });
    }
  };
  
  // Save configurations to native module
  const handleSaveConfiguration = async () => {
    try {
      // Save delay duration to shared UserDefaults through native module
      await ScreenTimeModule.setDelayDuration(settings.defaultDelayTime);
      
      // Call the original onSave callback
      onSave();
    } catch (error) {
      console.error('Error saving shield configuration:', error);
      // Still call onSave to not block navigation
      onSave();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Delay Screen Configuration
      </Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          DELAY TIME
        </Text>
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={settings.defaultDelayTime.toString()}
            onChangeText={handleDelayTimeChange}
            keyboardType="number-pad"
            placeholder="Delay in seconds"
            placeholderTextColor={isDark ? '#888888' : '#777777'}
          />
          <Text style={[styles.inputSuffix, { color: colors.text }]}>seconds</Text>
        </View>
        <Text style={[styles.description, { color: colors.text }]}>
          This is how long the delay screen will show before allowing access to the app.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          FLASHCARD BYPASS
        </Text>
        <View style={[styles.switchContainer, { borderColor: colors.border }]}>
          <View style={styles.switchTextContainer}>
            <Text style={[styles.switchTitle, { color: colors.text }]}>
              Enable Flashcards
            </Text>
            <Text style={[styles.switchDescription, { color: colors.text }]}>
              Allow users to answer flashcards to bypass the delay screen
            </Text>
          </View>
          <Switch
            value={settings.enableFlashcards}
            onValueChange={toggleFlashcards}
            trackColor={{ false: '#000000', true: '#FFFFFF' }}
            thumbColor={isDark ? '#000000' : '#FFFFFF'}
            ios_backgroundColor={isDark ? '#FFFFFF' : '#000000'}
          />
        </View>
        
        {settings.enableFlashcards && (
          <>
            <Text style={[styles.bypassTitle, { color: colors.text }]}>
              DAILY BYPASS LIMIT
            </Text>
            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={settings.dailyBypassLimit.toString()}
                onChangeText={handleBypassLimitChange}
                keyboardType="number-pad"
                placeholder="Bypass limit"
                placeholderTextColor={isDark ? '#888888' : '#777777'}
              />
              <Text style={[styles.inputSuffix, { color: colors.text }]}>per day</Text>
            </View>
            <Text style={[styles.description, { color: colors.text }]}>
              Maximum number of times a user can bypass the delay screen per day.
            </Text>
          </>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSaveConfiguration}
      >
        <Text style={[styles.saveButtonText, { color: colors.background }]}>
          SAVE CONFIGURATION
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  bypassTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 16,
    letterSpacing: 1,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 