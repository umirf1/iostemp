import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setOnboardingComplete } from '@/lib/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to FitcheckAI',
    description: 'Your personal AI-powered style assistant',
    icon: 'magic',
  },
  {
    title: 'Capture Your Style',
    description: 'Take photos of your outfits and get instant AI feedback',
    icon: 'camera',
  },
  {
    title: 'Track Your Progress',
    description: 'Build your style journey and see your improvement over time',
    icon: 'line-chart',
  },
  {
    title: 'Get Pro Features',
    description: 'Unlock advanced style analysis, personalized recommendations, and more',
    icon: 'star',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentStep + 1) * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete
      setOnboardingComplete();
      // Navigate to subscription screen
      router.push('/subscription');
    }
  };

  const handleSkip = () => {
    // Mark onboarding as complete
    setOnboardingComplete();
    router.push('/subscription');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Skip button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 16 }]}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Onboarding content */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const newStep = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentStep(newStep);
        }}
      >
        {ONBOARDING_STEPS.map((step, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.iconContainer}>
              <FontAwesome name={step.icon as any} size={64} color="#000" />
            </View>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Progress dots */}
      <View style={styles.dotsContainer}>
        {ONBOARDING_STEPS.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Next button */}
      <TouchableOpacity
        style={[styles.nextButton, { marginBottom: insets.bottom + 16 }]}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>
          {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginHorizontal: 32,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 