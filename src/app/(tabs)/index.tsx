import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Image, ScrollView, View, Animated, Platform, Easing } from "react-native";
import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = [
  {
    id: 1,
    icon: "rocket" as const,
    title: "Feature One",
    description: "Explore the first main feature",
    action: () => router.push("/camera" as any)
  },
  {
    id: 2,
    icon: "lightbulb-o" as const,
    title: "Feature Two",
    description: "Discover the second main feature",
    action: () => {}
  },
  {
    id: 3,
    icon: "bar-chart" as const,
    title: "Feature Three",
    description: "Track your progress and activity",
    action: () => {}
  }
];

// Interface for sample data
interface SampleData {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  score: number;
}

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [streakCount, setStreakCount] = useState<number>(3); // Default streak count
  const [streakDays, setStreakDays] = useState<Date[]>([]);
  const [sampleData, setSampleData] = useState<SampleData[]>([]);
  const stepsAnimatedValues = useRef(STEPS.map(() => new Animated.Value(0))).current;
  const [headerTapCount, setHeaderTapCount] = useState(0);
  const headerTapTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize sample data on component mount
  useEffect(() => {
    // Create sample data
    const data: SampleData[] = [
      {
        id: '1',
        title: 'Sample Item 1',
        description: 'This is a description for the first sample item',
        timestamp: new Date().toISOString(),
        score: 85
      },
      {
        id: '2',
        title: 'Sample Item 2',
        description: 'This is a description for the second sample item',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        score: 92
      },
      {
        id: '3',
        title: 'Sample Item 3',
        description: 'This is a description for the third sample item',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        score: 78
      }
    ];
    
    setSampleData(data);
  }, []);

  // Initialize streak days on component mount
  useEffect(() => {
    // For demo purposes, creating last 3 days of streak
    const today = new Date();
    const streak = [];
    for (let i = 0; i < streakCount; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      streak.unshift(date);
    }
    setStreakDays(streak);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (headerTapTimeout.current) {
        clearTimeout(headerTapTimeout.current);
      }
    };
  }, []);

  // Handle header tap to trigger onboarding after 5 taps
  const handleHeaderTap = () => {
    // Reset timeout if it exists
    if (headerTapTimeout.current) {
      clearTimeout(headerTapTimeout.current);
    }
    
    // Increment tap count
    const newCount = headerTapCount + 1;
    setHeaderTapCount(newCount);
    
    // Check if we've reached 5 taps
    if (newCount === 5) {
      // Navigate to onboarding
      router.push('/onboarding');
      // Reset counter
      setHeaderTapCount(0);
    } else {
      // Set timeout to reset counter after 3 seconds of inactivity
      headerTapTimeout.current = setTimeout(() => {
        setHeaderTapCount(0);
      }, 3000);
    }
  };

  // Helper function to format day label
  const formatDayLabel = (date: Date) => {
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Helper function to get last seven days
  const getLastSevenDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    
    return days;
  };

  // Check if date is in streak
  const isDateInStreak = (date: Date) => {
    return streakDays.some(d => d.toDateString() === date.toDateString());
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get relative time from timestamp
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Get emoji based on score
  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🔥';
    if (score >= 80) return '👍';
    if (score >= 70) return '😊';
    return '🙂';
  };

  // Render step card
  const renderStepCard = (step: typeof STEPS[0], index: number) => (
    <TouchableOpacity
      key={step.id}
      style={styles.stepCard}
      onPress={step.action}
    >
      <View style={styles.stepIconContainer}>
        <FontAwesome name={step.icon} size={24} color="#000" />
      </View>
      <View style={styles.stepTextContainer}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleHeaderTap} activeOpacity={0.7}>
            <Text style={styles.greeting}>
              Hello there!
              {headerTapCount > 0 && headerTapCount < 5 && (
                <Text style={styles.tapCounter}> ({5 - headerTapCount} more)</Text>
              )}
            </Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Welcome to your app template</Text>
        </View>

        {/* Streak section */}
        <View style={styles.streakContainer}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Your Streak</Text>
            <Text style={styles.streakCount}>{streakCount} days</Text>
          </View>
          
          <View style={styles.daysContainer}>
            {getLastSevenDays().map((date, index) => (
              <View key={index} style={styles.dayItem}>
                <View 
                  style={[
                    styles.dayDot, 
                    isDateInStreak(date) && styles.activeDayDot,
                    isToday(date) && styles.todayDot
                  ]}
                />
                <Text style={styles.dayLabel}>{formatDayLabel(date)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Steps section */}
        <View style={styles.stepsContainer}>
          <Text style={styles.sectionTitle}>Get Started</Text>
          {STEPS.map(renderStepCard)}
        </View>

        {/* Recent items section */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Items</Text>
          
          {sampleData.map(item => (
            <TouchableOpacity key={item.id} style={styles.recentItem}>
              <View style={styles.recentItemContent}>
                <View>
                  <Text style={styles.recentItemTitle}>{item.title}</Text>
                  <Text style={styles.recentItemDescription}>{item.description}</Text>
                  <Text style={styles.recentItemTime}>{getRelativeTime(item.timestamp)}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreEmoji}>{getScoreEmoji(item.score)}</Text>
                  <Text style={styles.scoreText}>{item.score}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tapCounter: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#999",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  streakContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 16,
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  streakCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginBottom: 4,
  },
  activeDayDot: {
    backgroundColor: "#000",
  },
  todayDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
  },
  dayLabel: {
    fontSize: 12,
    color: "#666",
  },
  stepsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
  },
  recentContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  recentItem: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  recentItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recentItemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  recentItemTime: {
    fontSize: 12,
    color: "#999",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
