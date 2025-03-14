import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [dataCollectionEnabled, setDataCollectionEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would handle the logout process
            console.log('User logged out');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would handle the account deletion process
            console.log('Account deleted');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    action?: () => void,
    toggle?: {
      value: boolean;
      onValueChange: (value: boolean) => void;
    }
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={action}
      disabled={!action}
    >
      <View style={styles.settingIconContainer}>
        <FontAwesome name={icon as any} size={20} color="#000" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onValueChange}
          trackColor={{ false: '#D1D1D6', true: '#000' }}
          thumbColor="#FFFFFF"
        />
      ) : action ? (
        <FontAwesome name="chevron-right" size={16} color="#999" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderSettingItem(
            'user',
            'Profile',
            'Manage your personal information',
            () => console.log('Navigate to profile')
          )}
          {renderSettingItem(
            'credit-card',
            'Subscription',
            'Manage your subscription plan',
            () => router.push('/subscription')
          )}
          {renderSettingItem(
            'sign-out',
            'Logout',
            'Sign out of your account',
            handleLogout
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingItem(
            'bell',
            'Notifications',
            'Receive alerts and reminders',
            undefined,
            {
              value: notificationsEnabled,
              onValueChange: setNotificationsEnabled,
            }
          )}
          {renderSettingItem(
            'moon-o',
            'Dark Mode',
            'Switch between light and dark themes',
            undefined,
            {
              value: darkModeEnabled,
              onValueChange: setDarkModeEnabled,
            }
          )}
          {renderSettingItem(
            'database',
            'Data Collection',
            'Help improve the app with usage data',
            undefined,
            {
              value: dataCollectionEnabled,
              onValueChange: setDataCollectionEnabled,
            }
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem(
            'question-circle',
            'Help Center',
            'Get answers to common questions',
            () => console.log('Navigate to help center')
          )}
          {renderSettingItem(
            'envelope',
            'Contact Us',
            'Reach out to our support team',
            () => console.log('Navigate to contact form')
          )}
          {renderSettingItem(
            'file-text-o',
            'Terms of Service',
            'Read our terms and conditions',
            () => console.log('Navigate to terms')
          )}
          {renderSettingItem(
            'shield',
            'Privacy Policy',
            'Learn how we protect your data',
            () => console.log('Navigate to privacy policy')
          )}
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  dangerSection: {
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  dangerButton: {
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
  },
}); 