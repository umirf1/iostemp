import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';

interface DelayScreenProps {
  appName: string;
  delayTime: number; // in seconds
  onComplete: () => void;
  onCancel: () => void;
  showFlashcardOption?: boolean;
}

// Motivational quotes to display during the delay
const QUOTES = [
  "Focus on what matters most.",
  "Small decisions shape your future.",
  "Taking a pause helps you regain control.",
  "Time is your most valuable resource.",
  "Each moment of focus builds a better you.",
  "Great work requires great focus.",
  "The present moment is where life happens.",
];

export default function DelayScreen({
  appName,
  delayTime,
  onComplete,
  onCancel,
  showFlashcardOption = true,
}: DelayScreenProps) {
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
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
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
    
    return () => clearInterval(timer);
  }, [isActive, timeLeft, onComplete]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Calculate progress percentage
  const progressPercentage = ((delayTime - timeLeft) / delayTime) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>DELAY SCREEN</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.appName, { color: colors.text }]}>
          {appName}
        </Text>
        
        <View style={[styles.timerContainer, { borderColor: colors.border }]}>
          <Text style={[styles.timer, { color: colors.text }]}>
            {formatTime(timeLeft)}
          </Text>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: colors.accent,
                  width: `${progressPercentage}%` 
                }
              ]} 
            />
          </View>
        </View>
        
        <Text style={[styles.quote, { color: colors.text }]}>
          "{quote}"
        </Text>
        
        {showFlashcardOption && (
          <TouchableOpacity 
            style={[styles.flashcardButton, { borderColor: colors.accent }]}
            onPress={() => {
              // Navigate to flashcard challenge
              // This would be implemented in a real app
              console.log('Flashcard challenge requested');
            }}
          >
            <Text style={[styles.flashcardButtonText, { color: colors.text }]}>
              Answer a flashcard to skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={[styles.footer, { color: colors.text }]}>
        Take a moment to consider if you really need to use this app right now.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 120,
    width: 240,
    height: 240,
    marginBottom: 40,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  quote: {
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  flashcardButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderRadius: 30,
  },
  flashcardButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    paddingBottom: 20,
    opacity: 0.7,
  },
}); 