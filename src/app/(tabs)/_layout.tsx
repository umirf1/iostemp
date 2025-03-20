import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

// Custom tab bar icon component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={22} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#FFFFFF' : '#000000',
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 10,
            letterSpacing: 1,
          },
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '600',
            letterSpacing: 1,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'DASHBOARD',
            tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="todo"
          options={{
            title: 'FOCUS',
            tabBarIcon: ({ color }) => <Ionicons name="timer-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="flashcards"
          options={{
            title: 'FLASHCARDS',
            tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="apps"
          options={{
            title: 'APPS',
            tabBarIcon: ({ color }) => <Ionicons name="apps-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="test"
          options={{
            title: 'TEST',
            tabBarIcon: ({ color }) => <Ionicons name="bug-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="demo"
          options={{
            title: 'DEMO',
            tabBarIcon: ({ color }) => <Ionicons name="play-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'SETTINGS',
            tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  // Additional styles if needed
});

