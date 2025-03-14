import React, { useRef, useEffect, useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity, Image, ScrollView, View, Animated, Platform, Easing, Dimensions } from "react-native";
import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/lib/hooks/useSettings';
import { useFocusData } from '@/lib/hooks/useFocusData';

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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { settings } = useSettings();
  const { todaysFocusTime, focusData } = useFocusData();
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    card: isDark ? '#000000' : '#FFFFFF',
    primary: isDark ? '#FFFFFF' : '#000000',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#FFFFFF' : '#000000',
  };

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

  // Mock data
  const [dailyGoal, setDailyGoal] = useState(settings.dailyFocusTarget); // minutes - from settings
  const [dailyUsage, setDailyUsage] = useState(0); // minutes
  const [goalProgress, setGoalProgress] = useState(0);
  
  // Update focus data when it changes
  useEffect(() => {
    // Convert seconds to minutes
    const focusMinutes = Math.floor(todaysFocusTime / 60);
    setDailyUsage(focusMinutes);
    setGoalProgress((focusMinutes / dailyGoal) * 100);
  }, [todaysFocusTime, dailyGoal]);
  
  // Function to determine color based on percentage of goal achieved
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#2E7D32'; // Dark green for 100%+
    if (percentage >= 75) return '#4CAF50';  // Light green for 75-99%
    if (percentage >= 50) return '#FFC107';  // Amber/yellow for 50-74%
    if (percentage >= 25) return '#FF9800';  // Orange for 25-49%
    return '#F44336';                        // Red for 0-24%
  };
  
  // Generate calendar data for the last 7 days with today as the rightmost day
  const generateCalendarData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      result.push({
        day: days[date.getDay()],
        date: date.getDate().toString(),
        success: true,
        progress: Math.floor(Math.random() * 120) + 10 // Random progress for demo
      });
    }
    
    return result;
  };
  
  // Calendar data (last 7 days) with progress percentages
  const calendar = generateCalendarData();
  
  // Update progress values when settings change
  useFocusEffect(
    useCallback(() => {
      setDailyGoal(settings.dailyFocusTarget);
      const focusMinutes = Math.floor(todaysFocusTime / 60);
      setDailyUsage(focusMinutes);
      setGoalProgress((focusMinutes / settings.dailyFocusTarget) * 100);
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: focusMinutes / settings.dailyFocusTarget,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false
      }).start();
    }, [settings, todaysFocusTime])
  );

  // Animation values
  const [progressAnim] = useState(new Animated.Value(0));

  // Run animations when component mounts
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: dailyUsage / dailyGoal,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  }, [dailyUsage, dailyGoal]);

  // Interpolate values for animations
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={handleHeaderTap} activeOpacity={0.8}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            PEAK<Text style={{ fontWeight: '300', color: colors.text }}>FOCUS</Text>
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.text }]}>
            Stay focused, achieve more
          </Text>
        </TouchableOpacity>
      </View>

      {/* Daily Focus Goal Card (renamed from Today's Progress) */}
      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>DAILY FOCUS GOAL</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/daily-goal-settings')}
          >
            <Ionicons name="settings-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressTextContainer}>
            <Text style={[styles.progressValue, { color: colors.text }]}>
              {dailyUsage}<Text style={[styles.progressUnit, { color: colors.text }]}> min</Text>
            </Text>
            <Text style={[styles.progressGoal, { color: colors.text }]}>
              of {dailyGoal} min focus goal
            </Text>
          </View>
          
          <View style={[styles.progressBarContainer, { borderColor: colors.border }]}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: progressWidth,
                }
              ]} 
            />
          </View>
          
          <Text style={[styles.progressRemaining, { color: colors.text }]}>
            {dailyGoal - dailyUsage} minutes left to focus today
          </Text>
        </View>
      </View>

      {/* Streak Card */}
      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>STREAK</Text>
        </View>
        
        <View style={styles.streakContainer}>
          <View style={[styles.streakCircle, { borderColor: colors.border }]}>
            <Text style={[styles.streakValue, { color: colors.text }]}>{focusData.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.text }]}>DAYS</Text>
          </View>
          
          <View style={styles.streakInfo}>
            <View style={styles.streakInfoItem}>
              <Ionicons name="trophy-outline" size={20} color={colors.text} />
              <Text style={[styles.streakInfoText, { color: colors.text }]}>
                Best: {focusData.longestStreak} days
              </Text>
            </View>
            <View style={styles.streakInfoItem}>
              <Ionicons name="flame-outline" size={20} color={colors.text} />
              <Text style={[styles.streakInfoText, { color: colors.text }]}>
                Keep it going!
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Calendar Card */}
      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>LAST 7 DAYS</Text>
        </View>
        
        <View style={styles.calendarContainer}>
          {calendar.map((day: { day: string; date: string; success: boolean; progress: number }, index: number) => (
            <View 
              key={index} 
              style={styles.calendarDay}
            >
              <Text style={[styles.calendarDayText, { color: colors.text }]}>{day.day}</Text>
              <View 
                style={[
                  styles.calendarDot, 
                  { 
                    backgroundColor: day.success ? getProgressColor(day.progress) : 'transparent',
                    borderColor: colors.border,
                    borderWidth: day.success ? 0 : 1
                  }
                ]} 
              />
              <Text style={[styles.calendarDateText, { color: colors.text }]}>{day.date}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 1,
  },
  // Step card styles
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    borderWidth: 1,
    borderRadius: 0,
    padding: 20,
    marginBottom: 24,
  },
  cardHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  settingsButton: {
    padding: 4,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressTextContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  progressUnit: {
    fontSize: 20,
    fontWeight: '400',
  },
  progressGoal: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000000',
  },
  progressRemaining: {
    fontSize: 14,
    fontWeight: '400',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 42,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  streakInfo: {
    flex: 1,
    paddingLeft: 20,
  },
  streakInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakInfoText: {
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 8,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  calendarDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  calendarDateText: {
    fontSize: 14,
    fontWeight: '400',
  },
  progressTooltip: {
    position: 'absolute',
    top: 45,
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    zIndex: 1,
  },
  progressTooltipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
