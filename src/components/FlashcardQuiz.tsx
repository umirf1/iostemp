import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';
import { Flashcard } from '@/types/flashcards';

interface FlashcardQuizProps {
  onComplete: () => void;
  onCancel: () => void;
  progressPercentage?: number; // Optional - internally calculated
}

// Mock data for flashcards
// In a real implementation, this would be fetched from your storage
const MOCK_FLASHCARDS: Flashcard[] = [
  {
    id: '1',
    question: 'What technique involves breaking tasks into 25-minute focused intervals?',
    answer: 'The Pomodoro Technique',
    deckId: '1'
  },
  {
    id: '2',
    question: 'What method involves tackling the most difficult task first?',
    answer: 'Eat the Frog',
    deckId: '1'
  },
  {
    id: '3',
    question: 'Which planet is known as the Red Planet?',
    answer: 'Mars',
    deckId: '2'
  },
  {
    id: '4',
    question: 'What is the capital of Japan?',
    answer: 'Tokyo',
    deckId: '2'
  },
  {
    id: '5',
    question: 'How can you reduce digital distractions?',
    answer: 'Turn off notifications, use focus apps, set screen time limits',
    deckId: '1'
  },
  {
    id: '6',
    question: 'What are the three pillars of productivity?',
    answer: 'Time, Energy, and Attention',
    deckId: '1'
  },
  {
    id: '7',
    question: 'Who wrote "The Great Gatsby"?',
    answer: 'F. Scott Fitzgerald',
    deckId: '2'
  },
  {
    id: '8',
    question: 'Which element has the chemical symbol "O"?',
    answer: 'Oxygen',
    deckId: '2'
  },
  {
    id: '9',
    question: 'What would you call a list of all tasks prioritized by importance?',
    answer: 'Priority Matrix or Eisenhower Box',
    deckId: '1'
  },
  {
    id: '10',
    question: 'What is the 2-minute rule in productivity?',
    answer: 'If a task takes less than 2 minutes, do it immediately',
    deckId: '1'
  },
];

export default function FlashcardQuiz({ 
  onComplete,
  onCancel,
  progressPercentage
}: FlashcardQuizProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    accent: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#333333' : '#CCCCCC',
  };

  // States for quiz
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Flashcard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canProgress, setCanProgress] = useState(false);
  // Track which answers have been viewed
  const [answersViewed, setAnswersViewed] = useState<boolean[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Calculate internal progress (overrides passed in value)
  const internalProgress = questions.length > 0 
    ? (currentQuestionIndex / questions.length) * 100
    : 0;

  // Minimum time to view each card (400ms = 0.4 seconds)
  const MIN_VIEW_TIME = 400;

  // Get 5 random flashcards
  useEffect(() => {
    // In a real implementation, you would filter by enableForQuiz
    // and fetch from your storage solution
    const getRandomCards = () => {
      const shuffled = [...MOCK_FLASHCARDS].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    };

    const cards = getRandomCards();
    setQuestions(cards);
    // Initialize the answersViewed array with false for each question
    setAnswersViewed(new Array(cards.length).fill(false));
    setLoading(false);
  }, []);

  // Timer to enforce minimum viewing time
  useEffect(() => {
    if (!loading && questions.length > 0) {
      setCanProgress(false);
      const timer = setTimeout(() => {
        setCanProgress(true);
      }, MIN_VIEW_TIME);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, showAnswer, loading, questions]);

  // Handle card flipping
  const flipCard = () => {
    if (!canProgress) return;
    
    setCanProgress(false);
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    // If flipping to show answer, mark this question's answer as viewed
    if (!showAnswer) {
      const updatedAnswersViewed = [...answersViewed];
      updatedAnswersViewed[currentQuestionIndex] = true;
      setAnswersViewed(updatedAnswersViewed);
    }
    
    setShowAnswer(!showAnswer);
    
    // Reset the lock timer when flipping the card
    setTimeout(() => {
      setCanProgress(true);
    }, MIN_VIEW_TIME);
  };

  // Handle next question
  const nextQuestion = () => {
    // Prevent going to next question if the current answer hasn't been viewed
    if (!canProgress || !answersViewed[currentQuestionIndex]) return;
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowAnswer(false);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      } else {
        // Only complete if all answers have been viewed
        if (answersViewed.every(viewed => viewed)) {
          onComplete();
        }
      }
    });
  };

  // Check if the current question's answer has been viewed
  const hasViewedCurrentAnswer = answersViewed[currentQuestionIndex];

  // Header component
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={onCancel} 
        style={styles.backButton}
      >
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>FLASHCARD QUIZ</Text>
      <View style={styles.placeholder} />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header />
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading questions...</Text>
        </View>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header />
        <View style={styles.centeredContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            No flashcards available. Please add flashcards to your decks.
          </Text>
          <TouchableOpacity
            style={[styles.button, { borderColor: colors.text }]}
            onPress={onCancel}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBar, 
              {
                backgroundColor: colors.text,
                width: `${progressPercentage ?? internalProgress}%`
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          Answer all {questions.length} questions to continue
        </Text>
      </View>

      {/* Question Counter */}
      <Text style={[styles.questionCounter, { color: colors.text }]}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Text>

      {/* Flashcard */}
      <Animated.View 
        style={[
          styles.card, 
          { 
            borderColor: colors.text,
            opacity: fadeAnim,
          }
        ]}
      >
        <Text style={[styles.questionText, { color: colors.text }]}>
          {showAnswer ? 'Answer:' : 'Question:'}
        </Text>
        <Text style={[styles.contentText, { color: colors.text }]}>
          {showAnswer ? currentQuestion.answer : currentQuestion.question}
        </Text>
      </Animated.View>
      
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { borderColor: colors.text }]}
          onPress={flipCard}
          disabled={!canProgress}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {showAnswer ? 'Show Question' : 'Show Answer'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            { 
              borderColor: colors.text,
              backgroundColor: (canProgress && hasViewedCurrentAnswer) ? colors.text : 'transparent',
              opacity: (canProgress && hasViewedCurrentAnswer) ? 1 : 0.5,
            }
          ]}
          onPress={nextQuestion}
          disabled={!canProgress || !hasViewedCurrentAnswer}
        >
          <Text style={[
            styles.buttonText, 
            { color: (canProgress && hasViewedCurrentAnswer) ? colors.background : colors.text }
          ]}>
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Instruction text */}
      <Text style={[styles.instructionText, { color: colors.text }]}>
        {hasViewedCurrentAnswer 
          ? 'Ready to continue!' 
          : 'You must view the answer before continuing'
        }
      </Text>
      
      {/* Footer Info */}
      <Text style={[styles.footer, { color: colors.text }]}>
        Answering all questions will grant access to the app.
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
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  progressContainer: {
    width: '100%',
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#333333',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginVertical: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  skipButton: {
    marginTop: 30,
    padding: 10,
  },
  skipText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
}); 