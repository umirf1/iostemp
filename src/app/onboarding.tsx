import React, { useRef, useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setOnboardingComplete } from '@/lib/onboarding';
import { useColorScheme } from '@/components/useColorScheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define the onboarding questions
const ONBOARDING_QUESTIONS = [
  {
    question: "Let's start with the basics. How often do you find yourself checking social media or other apps without meaning to?",
    options: [
      "A few times a day—it's not too bad",
      "Every hour or so—it's starting to bug me",
      "Constantly—it's like my hands have a mind of their own",
      "Only when I get notifications—but they're nonstop"
    ]
  },
  {
    question: "When during the day do distractions hit you the hardest?",
    options: [
      "Morning—I start my day scrolling instead of setting the tone",
      "Midday—work or study time gets derailed",
      "Afternoon—I hit a slump and apps pull me in",
      "Evening—it's my unwind time, but it goes too far",
      "Late night—I can't stop, and it messes with my sleep",
      "All day—I'm fighting a losing battle"
    ]
  },
  {
    question: "What's the biggest frustration you feel about your screen time right now?",
    options: [
      "Wasting hours I'll never get back",
      "Feeling overwhelmed by notifications and updates",
      "Losing focus on tasks that actually matter",
      "It's tanking my mood or sleep",
      "All of this—it's a mess, and I'm over it"
    ]
  },
  {
    question: "How do you feel after a long scroll session?",
    options: [
      "Refreshed—like it's a nice break",
      "Neutral—it's just something I do",
      "Guilty or drained—like I've thrown away my day",
      "Anxious or restless—comparing myself to others"
    ]
  },
  {
    question: "What's driving you to try PeakFocus today?",
    options: [
      "I want to cut my social media time way down",
      "I need to lock in during work or study hours",
      "I'm done with mindless scrolling—it's a habit I'm ready to ditch",
      "I want better sleep and less late-night screen glow",
      "I just need a change—I'm tired of feeling scattered"
    ]
  },
  {
    question: "Have you tried anything before to manage distractions or boost productivity?",
    options: [
      "Yep—apps like Forest, Freedom, or Focus@Will",
      "I've set my own phone limits, but I cheat",
      "I've tried willpower alone—spoiler: it didn't work",
      "Not yet—I'm starting fresh with PeakFocus"
    ]
  },
  {
    question: "Imagine a distraction-free day—what's one thing you'd finally get done?",
    options: [
      "Crush a work project or school assignment",
      "Dive into a hobby or skill I've been wanting to learn",
      "Spend real, uninterrupted time with people I care about",
      "Feel calm and in control of my day",
      "Something else—I'll tell you below"
    ]
  },
  {
    question: "What's your long-term dream that more focus could help you achieve?",
    options: [
      "Finish a passion project—like writing a book or building something",
      "Level up my career or grades with consistent effort",
      "Master a new skill—think coding, cooking, or a language",
      "Improve my mental health—less stress, more peace",
      "I'm still figuring it out, but I know focus is key"
    ]
  },
  {
    question: "How do you best stay motivated or tackle challenges?",
    options: [
      "Seeing progress—like stats, streaks, or colorful charts",
      "Fun stuff—like quizzes, games, or little wins",
      "Straightforward goals—keep it simple and clear",
      "Encouragement—like pep talks or rewards"
    ]
  },
  {
    question: "When you're tempted to open an app, how do you want PeakFocus to step in?",
    options: [
      "Give me a quick pause to rethink—short and sweet",
      "Hit me with a flashcard challenge—make me earn it",
      "Lock it down with strict limits—no excuses",
      "Surprise me—mix it up to keep me on my toes"
    ]
  },
  {
    question: "How much do you care about tracking your focus wins?",
    options: [
      "A lot—I'm all about stats, graphs, and milestones",
      "A little—just give me the basics",
      "Not much—I'd rather keep it low-key",
      "I don't know—show me what's possible"
    ]
  },
  {
    question: "What's one time of day you'd love to protect from distractions?",
    options: [
      "Morning—to start strong",
      "Midday—to power through work or study",
      "Evening—to relax without screens",
      "Late night—to wind down and sleep better"
    ]
  },
  {
    question: "How confident are you right now that you can change your habits?",
    options: [
      "Super confident—I'm ready to crush it",
      "Pretty hopeful—I think I can do this",
      "On the fence—I want to, but it feels hard",
      "Not very—I've struggled before"
    ]
  },
  {
    question: "Ready to take control of your digital life?",
    options: [
      "Let's do this!"
    ]
  }
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme to match the app
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#333333' : '#DDDDDD',
    card: isDark ? '#111111' : '#F5F5F5',
  };

  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [isRevisiting, setIsRevisiting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<number[]>(Array(ONBOARDING_QUESTIONS.length).fill(-1));

  // Check if user is revisiting onboarding from the main app
  useEffect(() => {
    // If we're coming from the main app, we're revisiting
    if (router.canGoBack()) {
      setIsRevisiting(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentStep + 1) * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to subscription screen after completing all questions
      router.push('/subscription');
    }
  };

  const handleReturnToApp = () => {
    router.back();
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
    
    // Auto-advance to next question after selection
    if (questionIndex === currentStep) {
      setTimeout(() => {
        handleNext();
      }, 300); // Small delay for better UX
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Return to app button (only shown when revisiting) */}
      {isRevisiting && (
        <TouchableOpacity
          style={[styles.returnButton, { top: insets.top + 16 }]}
          onPress={handleReturnToApp}
        >
          <Text style={[styles.returnText, { color: colors.text }]}>BACK</Text>
        </TouchableOpacity>
      )}

      {/* Progress indicator */}
      <View style={[styles.progressContainer, { top: insets.top + 16 }]}>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {currentStep + 1}/{ONBOARDING_QUESTIONS.length}
        </Text>
      </View>

      {/* Onboarding content */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {ONBOARDING_QUESTIONS.map((question, questionIndex) => (
          <View key={questionIndex} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Text style={[styles.question, { color: colors.text }]}>
              {question.question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {question.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionButton,
                    { 
                      borderColor: colors.text,
                      backgroundColor: selectedOptions[questionIndex] === optionIndex 
                        ? colors.text 
                        : colors.background
                    }
                  ]}
                  onPress={() => handleSelectOption(questionIndex, optionIndex)}
                >
                  <Text 
                    style={[
                      styles.optionText, 
                      { 
                        color: selectedOptions[questionIndex] === optionIndex 
                          ? colors.background 
                          : colors.text 
                      }
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Next button - only show if no option is selected for the current step */}
      {selectedOptions[currentStep] === -1 && (
        <TouchableOpacity
          style={[
            styles.nextButton, 
            { 
              marginBottom: insets.bottom + 16,
              backgroundColor: colors.background,
              borderColor: colors.text,
              borderWidth: 1,
              opacity: 0.5
            }
          ]}
          disabled={true}
        >
          <Text style={[styles.nextButtonText, { color: colors.text }]}>
            SELECT AN OPTION
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  returnButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  returnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  progressContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100, // Increased from 80 to avoid overlap with Back button
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 0,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  nextButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 0,
    width: '90%',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    marginRight: 8,
  },
}); 