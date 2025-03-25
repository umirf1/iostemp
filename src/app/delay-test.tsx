import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, NativeModules } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Stack } from 'expo-router';

const { ScreenTimeModule } = NativeModules;

export default function DelayTestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [delayDuration, setDelayDuration] = useState('30');
  
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    button: isDark ? '#FFFFFF' : '#000000',
    buttonText: isDark ? '#000000' : '#FFFFFF',
    border: isDark ? '#FFFFFF' : '#000000',
  };

  const requestAuthorization = () => {
    ScreenTimeModule.requestAuthorization((error: string | null, success: boolean) => {
      if (error) {
        Alert.alert('Authorization Failed', error);
      } else {
        Alert.alert('Authorization Success', 'Family Controls authorization was successful!');
      }
    });
  };

  const saveDelayDuration = () => {
    const duration = parseInt(delayDuration, 10);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid number of seconds');
      return;
    }

    ScreenTimeModule.setDelayDuration(duration);
    Alert.alert('Success', `Delay duration set to ${duration} seconds`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Delay Screen Test',
        headerShown: true
      }} />
      
      <Text style={[styles.title, { color: colors.text }]}>
        Screen Time Delay Test
      </Text>
      
      <Text style={[styles.description, { color: colors.text }]}>
        First, request authorization for Family Controls. Then, set your desired delay duration and test it by opening an app with Screen Time limits.
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.button }]}
        onPress={requestAuthorization}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>
          Request Authorization
        </Text>
      </TouchableOpacity>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          Delay Duration (seconds):
        </Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={delayDuration}
          onChangeText={setDelayDuration}
          keyboardType="number-pad"
          placeholder="Enter seconds"
          placeholderTextColor={isDark ? '#888888' : '#777777'}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.button }]}
        onPress={saveDelayDuration}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>
          Save Delay Duration
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.instructions, { color: colors.text }]}>
        After setting the delay duration, go to your iPhone Settings:
        {'\n\n'}
        1. Open Settings → Screen Time → App Limits
        {'\n'}
        2. Set limits for some apps
        {'\n'}
        3. Try to open those apps
        {'\n'}
        4. Your custom delay screen should appear!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  instructions: {
    fontSize: 14,
    marginTop: 20,
    lineHeight: 20,
  },
}); 