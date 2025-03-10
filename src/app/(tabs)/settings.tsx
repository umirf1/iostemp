import { StyleSheet, ScrollView, Switch, TouchableOpacity, Platform, Alert } from "react-native";
import { Text, View } from "@/components/Themed";
import { useState } from "react";
import { resetOnboardingStatus } from "@/lib/onboarding";
import { router } from "expo-router";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const handleResetOnboarding = async () => {
    Alert.alert(
      "Reset Onboarding",
      "Are you sure you want to reset the onboarding experience? The app will restart.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          onPress: async () => {
            await resetOnboardingStatus();
            // Navigate to onboarding
            router.replace("/onboarding");
          }
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      {/* User Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>John Doe</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>john.doe@example.com</Text>
        </View>
      </View>
      
      {/* Subscription Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionTitle}>Current Balance</Text>
          <Text style={styles.subscriptionAmount}>$0</Text>
          <TouchableOpacity style={styles.referralButton}>
            <Text style={styles.referralButtonText}>Refer friends to earn $</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Customization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customization</Text>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingLabel}>Personal style preferences</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingLabel}>Favorite brands</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
      
      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#767577", true: "#FF6B00" }}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: "#FF6B00" }}
          />
        </View>
      </View>
      
      {/* Developer Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer Options</Text>
        <TouchableOpacity 
          style={[styles.settingRow, styles.resetButton]} 
          onPress={handleResetOnboarding}
        >
          <Text style={styles.resetButtonText}>Reset Onboarding</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  subscriptionCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  subscriptionTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  subscriptionAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  referralButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  referralButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingLabel: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 20,
    color: "#999",
  },
  resetButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 0,
  },
  resetButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
}); 