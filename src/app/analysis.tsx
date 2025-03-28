import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated, Easing } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Loading states with their corresponding messages
const LOADING_STATES = [
  { progress: 24, message: 'Analyzing outfit style...' },
  { progress: 45, message: 'Evaluating color coordination...' },
  { progress: 68, message: 'Checking fit and proportions...' },
  { progress: 85, message: 'Assessing overall composition...' },
  { progress: 99, message: 'Finalizing your style report...' },
];

export default function AnalysisScreen() {
  const { imageUri, category } = useLocalSearchParams<{ imageUri: string; category: string }>();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing analysis...');
  const animatedValue = new Animated.Value(0);
  
  // Simulate the analysis process with timed animations
  useEffect(() => {
    // Create animations for each loading state
    const animations = LOADING_STATES.map((state, index) => {
      const duration = index === LOADING_STATES.length - 1 ? 4000 : 2000; // Longer duration for final state
      return Animated.timing(animatedValue, {
        toValue: state.progress / 100,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      });
    });

    // Start the animation sequence
    Animated.sequence(animations).start();

    // Update progress and status text based on animated value
    animatedValue.addListener(({ value }) => {
      const currentProgress = Math.floor(value * 100);
      setProgress(currentProgress);
      
      // Find the appropriate status message
      const currentState = LOADING_STATES.find(state => currentProgress <= state.progress);
      if (currentState) {
        setStatus(currentState.message);
      }
      
      // Trigger haptic feedback at certain thresholds
      if (LOADING_STATES.some(state => state.progress === currentProgress)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });
    
    // Navigate to results after the full animation
    const navigationTimer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: '/results' as any,
        params: { 
          imageUri,
          category,
          score: Math.floor(Math.random() * 30) + 70, // Random score between 70-99
        }
      });
    }, 12000);
    
    // Clean up
    return () => {
      animatedValue.removeAllListeners();
      clearTimeout(navigationTimer);
    };
  }, []);
  
  // Calculate the circle's circumference and stroke-dashoffset
  const circleCircumference = 2 * Math.PI * 45;
  const circleOffset = circleCircumference * (1 - progress / 100);
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Image (dimmed) */}
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.backgroundImage}
          blurRadius={3}
        />
      )}
      
      <View style={styles.overlay}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <Animated.View style={styles.progressCircleContainer}>
            <Svg width={100} height={100} viewBox="0 0 100 100">
              <Circle
                cx="50"
                cy="50"
                r="45"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                fill="transparent"
                opacity="0.3"
              />
              <AnimatedCircle
                cx="50"
                cy="50"
                r="45"
                stroke="#FFFFFF"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circleCircumference}
                strokeDashoffset={circleOffset}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.progressText}>{progress}%</Text>
          </Animated.View>
          
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.notificationText}>We'll notify you when done!</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressCircleContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  notificationText: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 14,
    textAlign: 'center',
  },
}); 