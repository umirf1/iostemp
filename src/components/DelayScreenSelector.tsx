import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSettings } from '@/lib/hooks/useSettings';
import { useFocusData } from '@/lib/hooks/useFocusData';
import FlashcardQuiz from './FlashcardQuiz';
import BreathingDelayScreen from './BreathingDelayScreen';

interface DelayScreenSelectorProps {
  appName: string;
  delayTime: number;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * DelayScreenSelector decides which delay screen to show based on user settings
 * and progress toward daily goals.
 * 
 * - If flashcard quiz mode is enabled: Show the flashcard quiz
 * - Otherwise: Show the breathing delay (cannot be bypassed until daily focus goal is met)
 */
export default function DelayScreenSelector({
  appName,
  delayTime,
  onComplete,
  onCancel
}: DelayScreenSelectorProps) {
  const { settings } = useSettings();
  const { todaysFocusTime } = useFocusData();
  
  // Check if the user has met their daily focus goal
  const hasMet24HourGoal = todaysFocusTime >= (settings.dailyFocusTarget * 60);
  
  // Determine which delay screen to show
  if (settings.enableFlashcards) {
    // Show the flashcard quiz screen
    return (
      <View style={styles.container}>
        <FlashcardQuiz 
          onComplete={onComplete}
          onCancel={onCancel}
        />
      </View>
    );
  } else {
    // Show the breathing delay screen, only allow bypass if goal is met
    return (
      <View style={styles.container}>
        <BreathingDelayScreen
          appName={appName}
          delayTime={delayTime}
          allowBypass={hasMet24HourGoal}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  }
}); 