import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useColorScheme } from './useColorScheme';

interface BreathingAnimationProps {
  delayTime: number; // Total delay time in seconds
  onComplete: () => void;
  progressPercentage: number; // Progress percentage (0-100)
}

export default function BreathingAnimation({ 
  delayTime, 
  onComplete,
  progressPercentage 
}: BreathingAnimationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    accent: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#333333' : '#CCCCCC',
  };

  // Animation values
  const breathAnimation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [breathDirection, setBreathDirection] = useState<'in' | 'out'>('in');
  
  // Create custom easing curves for smoother transitions
  const breathInEasing = Easing.bezier(0.2, 0, 0.4, 1); // Slow start, slightly faster end
  const breathOutEasing = Easing.bezier(0.4, 0, 0.2, 1); // More gradual exhale

  // Calculate total breaths based on delay time (1 breath cycle = 8 seconds)
  const totalBreathCycles = Math.ceil(delayTime / 8);
  
  // Set up the breathing animation sequence
  useEffect(() => {
    // Function to update breath direction
    const updateDirection = (direction: 'in' | 'out') => {
      setBreathDirection(direction);
    };

    // Keep track of previous value and direction
    let previousValue = 0;
    let isExpanding = true;

    // Breath animation sequence
    const createBreathSequence = () => {
      return Animated.sequence([
        // Inhale phase - set direction to 'in'
        Animated.timing(breathAnimation, {
          toValue: 1,
          duration: 4500, // Slightly longer inhale (4.5 seconds)
          easing: breathInEasing, // Custom easing for inhale
          useNativeDriver: false,
        }),
        // Wait at full breath
        Animated.delay(1200), // Pause at full breath
        // Exhale phase
        Animated.timing(breathAnimation, {
          toValue: 0,
          duration: 5500, // Longer exhale (5.5 seconds)
          easing: breathOutEasing, // Custom easing for exhale
          useNativeDriver: false,
        }),
        // Wait at empty breath
        Animated.delay(800), // Shorter pause before next inhale
      ]);
    };

    // Complete sequence
    const runBreathingSequence = () => {
      const sequences = [];
      
      // Create animation sequence for each breath cycle
      for (let i = 0; i < totalBreathCycles; i++) {
        sequences.push(createBreathSequence());
      }
      
      // Run all sequences and then call onComplete
      Animated.sequence(sequences).start(() => {
        console.log('Breathing animation complete');
        onComplete();
      });
    };

    // Initial direction is 'in'
    setBreathDirection('in');
    
    // Start the animation
    runBreathingSequence();

    // Set up a listener for the breath animation to track direction
    const breathListener = breathAnimation.addListener(({ value }) => {
      // Detect direction changes by comparing current and previous values
      const currentlyExpanding = value > previousValue;
      
      // Only update direction when the expansion/contraction phase actually changes
      if (currentlyExpanding !== isExpanding) {
        // If we were expanding and now we're contracting, we've reached the peak
        if (isExpanding && !currentlyExpanding && value > 0.95) {
          updateDirection('out');
        } 
        // If we were contracting and now we're expanding, we've reached the bottom
        else if (!isExpanding && currentlyExpanding && value < 0.05) {
          updateDirection('in');
        }
        
        // Update the direction tracking
        isExpanding = currentlyExpanding;
      }
      
      previousValue = value;
    });

    // Clean up
    return () => {
      breathAnimation.stopAnimation();
      textOpacity.stopAnimation();
      breathAnimation.removeListener(breathListener);
    };
  }, [breathAnimation, textOpacity, delayTime, onComplete, totalBreathCycles]);

  // Calculate the size for the breathing circle - pure black circle
  const circleSize = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 220], // Min and max size of circle for smoother animation
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: colors.accent,
            width: `${progressPercentage}%`,
            opacity: 0, // Hide the progress bar completely
          },
        ]}
      />
      
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize, // Make it a perfect circle
              backgroundColor: '#000000', // Always black circle
            },
          ]}
        >
          <Text
            style={[
              styles.breathText,
              {
                color: '#FFFFFF', // Always white text
              },
            ]}
          >
            {breathDirection === 'in' ? 'Breathe in...' : 'Breathe out...'}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  progressBar: {
    height: 3,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 0,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
  },
  breathingCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  breathText: {
    fontSize: 12, // Smaller text 
    fontWeight: '600',
    textAlign: 'center',
  },
}); 