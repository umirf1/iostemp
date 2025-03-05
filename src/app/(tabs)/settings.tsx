import { StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { useState } from "react";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 8,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
  },
  subscriptionCard: {
    alignItems: "center",
    padding: 16,
  },
  subscriptionTitle: {
    fontSize: 16,
    color: "#666",
  },
  subscriptionAmount: {
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 8,
  },
  referralButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  referralButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
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
}); 