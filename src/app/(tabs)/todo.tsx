import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useFocusData } from '@/lib/hooks/useFocusData';

export default function FocusScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addFocusSession, focusData } = useFocusData();
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    accent: '#4CAF50', // Green accent color for buttons
    border: isDark ? '#333333' : '#DDDDDD',
  };

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);

  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const progressValue = useSharedValue(0);

  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start the stopwatch
  const startStopwatch = () => {
    if (!isRunning) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startTimeRef.current = Date.now() - (elapsedTime * 1000);
      setIsRunning(true);
      
      // Start the animation for the circle only
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 60000, // 1 minute rotation
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false // Don't reverse
      );
      
      // Animate the progress circle
      progressValue.value = withRepeat(
        withTiming(1, { duration: 60000, easing: Easing.linear }),
        -1, // Infinite repeat
        false // Don't reverse
      );
      
      // Start the timer to count up
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          const newElapsedTime = Math.floor((now - startTimeRef.current) / 1000);
          setElapsedTime(newElapsedTime);
        }
      }, 1000);
    }
  };

  // Stop the stopwatch
  const stopStopwatch = async () => {
    if (isRunning) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Clear the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
      
      // Stop the animation
      rotation.value = withTiming(rotation.value, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      // Reset progress animation
      progressValue.value = withTiming(0, { duration: 300 });
      
      // Record the focus session
      if (elapsedTime > 0) {
        try {
          await addFocusSession(elapsedTime);
          console.log(`Focus session recorded: ${elapsedTime} seconds`);
        } catch (error) {
          console.error('Failed to record focus session:', error);
        }
      }
    }
  };

  // Reset the stopwatch
  const resetStopwatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopStopwatch();
    setElapsedTime(0);
    startTimeRef.current = null;
    
    // Reset animation
    scale.value = withTiming(0.8, { duration: 150 }, () => {
      scale.value = withTiming(1, { duration: 150 });
    });
    progressValue.value = 0;
  };

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (isRunning && appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App is going to background while timer is running
        Alert.alert(
          'Focus Session Active',
          'Do you want to end your focus session? Your progress will be recorded.',
          [
            {
              text: 'Continue Focus',
              style: 'cancel',
            },
            {
              text: 'End Session',
              style: 'destructive',
              onPress: stopStopwatch,
            },
          ]
        );
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isRunning]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Set a default time display
  useEffect(() => {
    // Set the initial time to 0
    setElapsedTime(0);
  }, []);

  // Animated styles
  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });
  
  // Progress circle animation
  const progressCircleStyle = useAnimatedStyle(() => {
    return {
      width: 250,
      height: 250,
      borderRadius: 125,
      position: 'absolute',
      borderWidth: 4,
      borderColor: 'transparent',
      borderTopColor: isDark ? '#444' : '#CCC',
      transform: [
        { rotate: `${progressValue.value * 360}deg` }
      ],
    };
  });

  // Function to get the last 10 focus sessions across all days
  const getLastTenSessions = () => {
    const allSessions: Array<{
      id: string;
      date: string;
      duration: number;
      sessionNumber: number;
    }> = [];
    
    // Get all sessions from all days
    Object.entries(focusData.dailyFocus).forEach(([date, dayData]) => {
      // Add session number to each session
      dayData.sessions.forEach((session, index) => {
        allSessions.push({
          ...session,
          sessionNumber: index + 1
        });
      });
    });
    
    // Sort by date (newest first)
    allSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Return only the last 10
    return allSessions.slice(0, 10);
  };
  
  // Format session date to a readable format
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format duration in seconds to a readable format
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>
        FOCUS SESSION
      </Text>
      
      <View style={styles.stopwatchContainer}>
        <Animated.View style={[styles.animatedCircle, animatedCircleStyle, { borderColor: colors.text }]} />
        <Animated.View style={progressCircleStyle} />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.text }]}>
            {formatTime(elapsedTime)}
          </Text>
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity 
            style={[styles.button, { 
              backgroundColor: colors.background, 
              borderColor: colors.text,
              borderWidth: 1
            }]}
            onPress={startStopwatch}
          >
            <Ionicons name="play" size={24} color={colors.text} />
            <Text style={[styles.buttonText, { color: colors.text }]}>START FOCUS SESSION</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, { 
              backgroundColor: colors.background, 
              borderColor: colors.text,
              borderWidth: 1
            }]}
            onPress={() => {
              Alert.alert(
                'End Focus Session',
                'Do you want to end your focus session? Your progress will be recorded.',
                [
                  {
                    text: 'Continue Focus',
                    style: 'cancel',
                  },
                  {
                    text: 'End Session',
                    style: 'destructive',
                    onPress: stopStopwatch,
                  },
                ]
              );
            }}
          >
            <Ionicons name="stop" size={24} color={colors.text} />
            <Text style={[styles.buttonText, { color: colors.text }]}>END FOCUS SESSION</Text>
          </TouchableOpacity>
        )}
        
        {elapsedTime > 0 && !isRunning && (
          <TouchableOpacity 
            style={[styles.resetButton, { borderColor: colors.border }]}
            onPress={resetStopwatch}
          >
            <Ionicons name="refresh" size={20} color={colors.text} />
            <Text style={[styles.resetButtonText, { color: colors.text }]}>RESET</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Last 10 Sessions Section */}
      <View style={[styles.sessionsContainer, { borderTopColor: colors.border }]}>
        <Text style={[styles.sessionsTitle, { color: colors.text }]}>YOUR LAST 10 SESSIONS</Text>
        
        {focusData.dailyFocus && Object.keys(focusData.dailyFocus).length > 0 ? (
          <ScrollView style={styles.sessionsList}>
            {getLastTenSessions().map((session, index) => (
              <View key={session.id} style={[styles.sessionItem, { borderBottomColor: colors.border }]}>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionDate, { color: colors.text }]}>
                    {formatSessionDate(session.date)}
                  </Text>
                  <Text style={[styles.sessionNumber, { color: colors.text }]}>
                    Session #{session.sessionNumber}
                  </Text>
                </View>
                <Text style={[styles.sessionDuration, { color: colors.text }]}>
                  {formatDuration(session.duration)}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={[styles.noSessionsText, { color: colors.text }]}>
            No focus sessions recorded yet. Start a focus session to track your progress.
          </Text>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          FOCUS MODE
        </Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          During a focus session, you'll be prevented from switching to other apps. 
          This helps maintain your concentration and build better focus habits.
        </Text>
        
        {isRunning && (
          <View style={[styles.activeIndicator, { borderColor: colors.accent }]}>
            <Ionicons name="radio-button-on" size={12} color={colors.accent} />
            <Text style={[styles.activeText, { color: colors.accent }]}>
              FOCUS SESSION ACTIVE
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
    textAlign: 'center',
  },
  stopwatchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  animatedCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    position: 'absolute',
  },
  timeContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  timeText: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 2,
  },
  controlsContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 0,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 0,
    borderWidth: 1,
    marginTop: 16,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginLeft: 8,
  },
  infoContainer: {
    marginTop: 'auto',
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 8,
  },
  
  // Session styles
  sessionsContainer: {
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    paddingHorizontal: 16,
  },
  sessionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sessionsList: {
    width: '100%',
    maxHeight: 200,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionNumber: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '600',
  },
  noSessionsText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
}); 