import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';
import BreathingAnimation from './BreathingAnimation';

interface BreathingDelayScreenProps {
  appName: string;
  delayTime: number; // in seconds
  onComplete: () => void;
  onCancel: () => void;
  allowBypass?: boolean; // Whether user has met daily focus goal and can bypass
  showFlashcardOption?: boolean; // Deprecated - kept for compatibility
}

// Mindfulness quotes focused on breathing and presence
const MINDFULNESS_QUOTES = [
  "Breathe in peace, breathe out tension.",
  "Be present with each breath.",
  "Your breath is your anchor to the present moment.",
  "Inhale calm, exhale worry.",
  "Each breath is a new beginning.",
  "Let your breath lead you to stillness.",
  "The present moment is all we truly have.",
  "Find your center with each breath.",
  "When in doubt, breathe it out.",
  "The quieter you become, the more you can hear.",
];

export default function BreathingDelayScreen({
  appName,
  delayTime,
  onComplete,
  onCancel,
  allowBypass = false,
  showFlashcardOption = false, // Deprecated - kept for compatibility
}: BreathingDelayScreenProps) {
  console.log('BreathingDelayScreen rendering with props:', { appName, delayTime, allowBypass });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    accent: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#333333' : '#CCCCCC',
  };

  const [timeLeft, setTimeLeft] = useState(delayTime);
  const [quote, setQuote] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Select a random quote
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MINDFULNESS_QUOTES.length);
    setQuote(MINDFULNESS_QUOTES[randomIndex]);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    console.log('BreathingDelayScreen timer started:', timeLeft);
    
    return () => {
      console.log('BreathingDelayScreen timer cleared');
      clearInterval(timer);
    };
  }, [isActive, timeLeft, onComplete]);

  // Calculate progress percentage
  const progressPercentage = ((delayTime - timeLeft) / delayTime) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {/* Only show close button if user is allowed to bypass */}
        {allowBypass ? (
          <TouchableOpacity 
            onPress={() => {
              console.log('Close button pressed');
              onCancel();
            }} 
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>MINDFUL MOMENT</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.appName, { color: colors.text }]}>
          {appName}
        </Text>
        
        <View style={[styles.animationContainer, { 
          backgroundColor: isDark ? '#222222' : '#F5F5F5' // Light gray in light mode, dark gray in dark mode
        }]}>
          <BreathingAnimation 
            delayTime={delayTime} 
            onComplete={onComplete}
            progressPercentage={progressPercentage}
          />
        </View>
        
        <Text style={[styles.quote, { color: colors.text }]}>
          "{quote}"
        </Text>
        
        {!allowBypass && (
          <View style={styles.focusGoalContainer}>
            <Text style={[styles.focusGoalText, { color: colors.text }]}>
              Complete your daily focus goal to bypass this screen
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.footer, { color: colors.text }]}>
        Take a moment to breathe and consider if you really need to use this app right now.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000', // Force black background to ensure visibility
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderRadius: 120,
    width: 240,
    height: 240,
    marginBottom: 40,
    overflow: 'hidden',
  },
  quote: {
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  focusGoalContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 20,
  },
  focusGoalText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    paddingBottom: 20,
    opacity: 0.7,
  },
}); 