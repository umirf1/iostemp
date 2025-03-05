import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated, Easing } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AnalysisScreen() {
  const { imageUri, category } = useLocalSearchParams<{ imageUri: string; category: string }>();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Analyzing outfit...');
  const animatedValue = new Animated.Value(0);
  
  // Simulate the analysis process with timed animations
  useEffect(() => {
    // Start animation sequence
    const sequence = [
      // Progress naturally to 24% (3-4 seconds)
      Animated.timing(animatedValue, {
        toValue: 0.24,
        duration: 3500,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      // Jump to 75% quickly (1-2 seconds)
      Animated.timing(animatedValue, {
        toValue: 0.75,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      // Slow progress to 99% (2-3 seconds)
      Animated.timing(animatedValue, {
        toValue: 0.99,
        duration: 2500,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ];
    
    // Execute the sequence
    Animated.sequence(sequence).start();
    
    // Update progress state based on animated value
    animatedValue.addListener(({ value }) => {
      setProgress(Math.floor(value * 100));
    });
    
    // Change status text after a delay
    const statusTimer = setTimeout(() => {
      setStatus('Finalizing results...');
    }, 7000);
    
    // Navigate to results after the full animation
    const navigationTimer = setTimeout(() => {
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
      clearTimeout(statusTimer);
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

// SVG components for the circular progress
const Svg = ({ children, ...props }: React.PropsWithChildren<any>) => (
  <View {...props}>{children}</View>
);

const Circle = ({ cx, cy, r, ...props }: { 
  cx: string | number; 
  cy: string | number; 
  r: string | number;
  stroke?: string;
  strokeWidth?: string | number;
  fill?: string;
  opacity?: string | number;
  strokeDasharray?: number;
  strokeDashoffset?: number;
  strokeLinecap?: string;
}) => {
  return (
    <View
      style={{
        width: Number(r) * 2,
        height: Number(r) * 2,
        borderRadius: Number(r),
        borderWidth: props.strokeWidth ? Number(props.strokeWidth) : 0,
        borderColor: props.stroke,
        opacity: props.opacity ? Number(props.opacity) : 1,
        position: 'absolute',
        top: Number(cy) - Number(r),
        left: Number(cx) - Number(r),
      }}
    />
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
}); 