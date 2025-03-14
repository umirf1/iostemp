import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/lib/hooks/useSettings';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { settings, updateSettings, isLoading } = useSettings();
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    card: isDark ? '#000000' : '#FFFFFF',
    primary: isDark ? '#FFFFFF' : '#000000',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#FFFFFF' : '#000000',
  };

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'delay' | 'bypass' | 'usage' | 'focus'>('delay');
  const [tempValue, setTempValue] = useState('');

  // Toggle functions
  const toggleFlashcards = async () => {
    await updateSettings({ enableFlashcards: !settings.enableFlashcards });
  };
  
  const toggleNotifications = async () => {
    await updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };
  
  const toggleDarkMode = async () => {
    await updateSettings({ darkMode: !settings.darkMode });
  };

  // Open modal with appropriate type and initial value
  const openModal = (type: 'delay' | 'bypass' | 'usage' | 'focus', initialValue: number) => {
    setModalType(type);
    setTempValue(initialValue.toString());
    setModalVisible(true);
  };

  // Save modal value
  const saveModalValue = async () => {
    const numValue = parseInt(tempValue, 10);
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Invalid Value', 'Please enter a positive number');
      return;
    }

    switch (modalType) {
      case 'delay':
        await updateSettings({ defaultDelayTime: numValue });
        break;
      case 'bypass':
        await updateSettings({ dailyBypassLimit: numValue });
        break;
      case 'usage':
        await updateSettings({ dailyUsageGoal: numValue });
        break;
      case 'focus':
        await updateSettings({ dailyFocusTarget: numValue });
        break;
    }

    setModalVisible(false);
  };

  // Render section header
  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{title}</Text>
    </View>
  );

  // Render switch setting
  const renderSwitchSetting = (
    title: string, 
    description: string, 
    value: boolean, 
    onToggle: () => void
  ) => (
    <View style={[styles.settingItem, { borderColor: colors.border }]}>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.text }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#000000', true: '#FFFFFF' }}
        thumbColor={isDark ? '#000000' : '#FFFFFF'}
        ios_backgroundColor={isDark ? '#FFFFFF' : '#000000'}
      />
    </View>
  );

  // Render value setting
  const renderValueSetting = (
    title: string, 
    description: string, 
    value: string | number,
    onPress: () => void
  ) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.text }]}>{description}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: colors.text }]}>{value}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>SETTINGS</Text>
        
        {/* Delay Settings */}
        {renderSectionHeader('DELAY SETTINGS')}
        {renderValueSetting(
          'DEFAULT DELAY TIME',
          'Set the default delay time for controlled apps',
          `${settings.defaultDelayTime} seconds`,
          () => openModal('delay', settings.defaultDelayTime)
        )}

        {/* Flashcard Settings */}
        {renderSectionHeader('FLASHCARD SETTINGS')}
        {renderSwitchSetting(
          'ENABLE FLASHCARDS',
          'Use flashcards to bypass delay screens',
          settings.enableFlashcards,
          toggleFlashcards
        )}
        {settings.enableFlashcards && renderValueSetting(
          'DAILY BYPASS LIMIT',
          'Maximum number of bypasses per day',
          settings.dailyBypassLimit.toString(),
          () => openModal('bypass', settings.dailyBypassLimit)
        )}

        {/* Usage Settings */}
        {renderSectionHeader('USAGE SETTINGS')}
        {renderValueSetting(
          'DAILY USAGE GOAL',
          'Set your daily app usage goal',
          `${settings.dailyUsageGoal} minutes`,
          () => router.push('/daily-goal-settings')
        )}
        {renderValueSetting(
          'DAILY FOCUS TARGET',
          'Set your daily focus time target',
          `${settings.dailyFocusTarget} minutes`,
          () => router.push('/focus-settings')
        )}

        {/* Notification Settings */}
        {renderSectionHeader('NOTIFICATION SETTINGS')}
        {renderSwitchSetting(
          'ENABLE NOTIFICATIONS',
          'Receive reminders and usage alerts',
          settings.notificationsEnabled,
          toggleNotifications
        )}

        {/* App Settings */}
        {renderSectionHeader('APP SETTINGS')}
        {renderSwitchSetting(
          'DARK MODE',
          'Toggle between light and dark theme',
          settings.darkMode,
          toggleDarkMode
        )}

        {/* Account */}
        {renderSectionHeader('ACCOUNT')}
        <TouchableOpacity 
          style={[styles.settingItem, { borderColor: colors.border }]}
          onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?')}
        >
          <Text style={[styles.dangerText, { color: colors.text }]}>SIGN OUT</Text>
        </TouchableOpacity>

        {/* About */}
        {renderSectionHeader('ABOUT')}
        {renderValueSetting(
          'VERSION',
          'Current app version',
          '1.0.0',
          () => {}
        )}
        <TouchableOpacity 
          style={[styles.settingItem, { borderColor: colors.border }]}
          onPress={() => Alert.alert('Privacy Policy', 'This would open the privacy policy')}
        >
          <Text style={[styles.settingTitle, { color: colors.text }]}>PRIVACY POLICY</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.settingItem, { borderColor: colors.border }]}
          onPress={() => Alert.alert('Terms of Service', 'This would open the terms of service')}
        >
          <Text style={[styles.settingTitle, { color: colors.text }]}>TERMS OF SERVICE</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Settings Value Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modalType === 'delay' ? 'Set Default Delay Time' : 
               modalType === 'bypass' ? 'Set Daily Bypass Limit' : 
               modalType === 'usage' ? 'Set Daily Usage Goal' : 
               'Set Daily Focus Target'}
            </Text>
            
            <TextInput
              style={[styles.modalInput, { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: isDark ? '#111111' : '#F5F5F5'
              }]}
              value={tempValue}
              onChangeText={setTempValue}
              keyboardType="number-pad"
              placeholder={
                modalType === 'delay' ? 'Delay in seconds' : 
                modalType === 'bypass' ? 'Number of bypasses' : 
                'Time in minutes'
              }
              placeholderTextColor={isDark ? '#888888' : '#777777'}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { 
                  backgroundColor: colors.primary,
                  borderColor: colors.border
                }]}
                onPress={saveModalValue}
              >
                <Text style={[styles.modalButtonText, { 
                  color: isDark ? colors.background : colors.background
                }]}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    marginRight: 8,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 