import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/lib/hooks/useSettings';
import { router } from 'expo-router';

export default function FocusSettingsScreen() {
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

  const [focusTarget, setFocusTarget] = useState(settings.dailyFocusTarget.toString());

  const handleSave = async () => {
    const numValue = parseInt(focusTarget, 10);
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Invalid Value', 'Please enter a positive number');
      return;
    }

    await updateSettings({ dailyFocusTarget: numValue });
    router.back();
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>FOCUS TARGET</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>
          Set your daily focus time target
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { 
              color: colors.text, 
              borderColor: colors.border,
              backgroundColor: isDark ? '#111111' : '#F5F5F5'
            }]}
            value={focusTarget}
            onChangeText={setFocusTarget}
            keyboardType="number-pad"
            placeholder="Time in minutes"
            placeholderTextColor={isDark ? '#888888' : '#777777'}
          />
          <Text style={[styles.inputUnit, { color: colors.text }]}>minutes</Text>
        </View>

        <Text style={[styles.description, { color: colors.text }]}>
          This is the amount of time you aim to focus each day. Setting a realistic target can help you build consistent focus habits.
        </Text>

        <View style={styles.presetContainer}>
          <Text style={[styles.presetLabel, { color: colors.text }]}>QUICK PRESETS</Text>
          <View style={styles.presetButtons}>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: colors.border }]}
              onPress={() => setFocusTarget('60')}
            >
              <Text style={[styles.presetButtonText, { color: colors.text }]}>1 hour</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: colors.border }]}
              onPress={() => setFocusTarget('120')}
            >
              <Text style={[styles.presetButtonText, { color: colors.text }]}>2 hours</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: colors.border }]}
              onPress={() => setFocusTarget('180')}
            >
              <Text style={[styles.presetButtonText, { color: colors.text }]}>3 hours</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: colors.border }]}
              onPress={() => setFocusTarget('240')}
            >
              <Text style={[styles.presetButtonText, { color: colors.text }]}>4 hours</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, { color: colors.background }]}>SAVE</Text>
      </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 18,
    marginRight: 12,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  presetContainer: {
    marginBottom: 32,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 