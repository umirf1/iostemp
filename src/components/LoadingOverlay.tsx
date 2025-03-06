import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  Easing, 
  Image
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Loading states with their corresponding messages
const LOADING_STATES = [
  { progress: 24, message: 'Analyzing outfit style...' },
  { progress: 45, message: 'Evaluating color coordination...' },
  { progress: 68, message: 'Checking fit and proportions...' },
  { progress: 85, message: 'Assessing overall composition...' },
  { progress: 99, message: 'Finalizing your style report...' },
];

interface LoadingOverlayProps {
  visible: boolean;
  imageUri?: string;
  onComplete: (score: number) => void;
}

export default function LoadingOverlay({ 
  visible, 
  imageUri, 
  onComplete 
}: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing analysis...');
  const animatedValue = new Animated.Value(0);
  
  useEffect(() => {
    if (visible) {
      // Reset progress when overlay becomes visible
      setProgress(0);
      animatedValue.setValue(0);
      
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
      });
      
      // Generate a random score between 70-99 and call onComplete after animation
      const navigationTimer = setTimeout(() => {
        const randomScore = Math.floor(Math.random() * 30) + 70;
        onComplete(randomScore);
      }, 12000);
      
      // Clean up
      return () => {
        animatedValue.removeAllListeners();
        clearTimeout(navigationTimer);
      };
    }
  }, [visible, onComplete]);
  
  if (!visible) return null;
  
  // Calculate the circle's circumference and stroke-dashoffset
  const circleCircumference = 2 * Math.PI * 45;
  const circleOffset = circleCircumference * (1 - progress / 100);
  
  return (
    <View style={styles.container}>
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 30,
    borderRadius: 20,
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