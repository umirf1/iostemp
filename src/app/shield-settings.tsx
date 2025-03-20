import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import ShieldConfiguration from '@/components/ShieldConfiguration';
import { router } from 'expo-router';

export default function ShieldSettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
  };

  const handleSave = () => {
    // Navigate back after saving
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ShieldConfiguration onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 