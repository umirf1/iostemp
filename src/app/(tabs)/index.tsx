import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Image, ScrollView, View, Animated, Platform, Easing } from "react-native";
import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
// Import the components
import OutfitSelectionModal from "@/components/OutfitSelectionModal";
import LoadingOverlay from "@/components/LoadingOverlay";
import { analyzeOutfitImage } from "@/lib/openai";

const STEPS = [
  {
    id: 1,
    icon: "camera-retro" as const,
    title: "Capture",
    description: "Take a photo of your outfit",
    action: () => router.push("/camera" as any)
  },
  {
    id: 2,
    icon: "magic" as const,
    title: "Analyze",
    description: "Get AI-powered style insights",
    action: () => {}
  },
  {
    id: 3,
    icon: "bar-chart" as const,
    title: "Track",
    description: "Build your style journey",
    action: () => {}
  }
];

// Interface for outfit data
interface OutfitData {
  id: string;
  imageUri: string;
  category: string;
  gender: string;
  score: number;
  timestamp: string;
  feedback?: string;
  details?: {
    style?: number;
    fit?: number;
    color?: number;
    occasion?: number;
  };
  suggestions?: string[];
}

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<OutfitData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('casual');
  const [selectedGender, setSelectedGender] = useState<string>('neutral');
  const [streakCount, setStreakCount] = useState<number>(3); // Default streak count
  const [streakDays, setStreakDays] = useState<Date[]>([]);
  const [loadingOutfit, setLoadingOutfit] = useState<{
    id: string;
    imageUri: string;
    progress: number;
  } | null>(null);
  const stepsAnimatedValues = useRef(STEPS.map(() => new Animated.Value(0))).current;
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const spinningAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  // Check for captured image from camera
  useEffect(() => {
    if (params.capturedImage) {
      console.log("Captured image received:", params.capturedImage);
      setLastCapturedImage(params.capturedImage as string);
      setSelectionModalVisible(true);
    }
  }, [params.capturedImage]);

  // Initialize streak days on component mount
  useEffect(() => {
    // For demo purposes, creating last 3 days of streak
    const today = new Date();
    const streak = [];
    for (let i = 0; i < streakCount; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      streak.unshift(date);
    }
    setStreakDays(streak);
  }, []);

  // Helper function to format day label
  const formatDayLabel = (date: Date) => {
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Get the last 7 days for display
  const getLastSevenDays = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const lastSevenDays = getLastSevenDays();

  // Helper function to check if a date is in the streak
  const isDateInStreak = (date: Date) => {
    return streakDays.some(streakDate => 
      streakDate.toDateString() === date.toDateString()
    );
  };

  // Helper function to check if date is today
  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  // Animate steps sequentially
  useEffect(() => {
    const animations = stepsAnimatedValues.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 300,
        useNativeDriver: true,
      });
    });

    Animated.sequence(animations).start();
  }, []);

  // Add spinning animation
  useEffect(() => {
    if (loadingOutfit) {
      // Reset the animation value
      spinAnimation.setValue(0);
      // Create and start the looping animation
      Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    }
  }, [loadingOutfit]); // Depend on loadingOutfit to restart animation when it changes

  const handleCameraPress = () => {
    router.push("/camera" as any);
  };

  const handleCloseModal = () => {
    setSelectionModalVisible(false);
  };

  const handleSubmitSelection = async (category: string, gender: string) => {
    console.log("Selection submitted:", { category, gender });
    setSelectedCategory(category);
    setSelectedGender(gender);
    setSelectionModalVisible(false);
    
    if (!lastCapturedImage) {
      console.error("No image captured");
      return;
    }
    
    // Save the image URI for later use
    const imageUri = lastCapturedImage;
    console.log("Using image URI:", imageUri);
    
    // Create a temporary loading outfit entry
    const loadingId = Date.now().toString();
    setLoadingOutfit({
      id: loadingId,
      imageUri: imageUri,
      progress: 24
    });

    try {
      // Update progress as analysis happens
      const progressUpdates = [
        { progress: 45, delay: 1000 },
        { progress: 75, delay: 3000 },
        { progress: 89, delay: 6000 }
      ];
      
      // Set up progress updates
      const progressTimers = progressUpdates.map(({ progress, delay }) => 
        setTimeout(() => {
          setLoadingOutfit(current => 
            current ? { ...current, progress } : null
          );
        }, delay)
      );
      
      // Perform the actual analysis
      console.log("Starting analysis with image:", imageUri);
      const result = await analyzeOutfitImage(imageUri, gender, category);
      console.log("Analysis result:", result);
      
      // Clear any remaining timers
      progressTimers.forEach(timer => clearTimeout(timer));
      
      // Set progress to 99% when we get the result
      setLoadingOutfit(current => 
        current ? { ...current, progress: 99 } : null
      );
      
      // Complete the analysis after a short delay
      setTimeout(() => {
        const score = result.score || 85; // Default to 85 if no score
        handleAnalysisComplete(imageUri, score, result.feedback || "", result.details, result.suggestions);
        setLoadingOutfit(null);
      }, 1000);
      
    } catch (error) {
      console.error("Error analyzing outfit:", error);
      setLoadingOutfit(null);
      
      // Show an error message to the user
      alert("We encountered an issue analyzing your outfit. Please try again.");
    }
  };

  const handleAnalysisComplete = (
    imageUri: string,
    score: number, 
    feedback: string = "", 
    details?: OutfitData['details'],
    suggestions?: string[]
  ) => {
    setLoadingVisible(false);
    
    // Add the new outfit to the list
    if (imageUri) {
      const newOutfit: OutfitData = {
        id: Date.now().toString(),
        imageUri: imageUri,
        category: selectedCategory,
        gender: selectedGender,
        score: score,
        timestamp: new Date().toISOString(),
        feedback: feedback,
        details: details,
        suggestions: suggestions
      };
      
      console.log("Adding new outfit to list:", newOutfit);
      setOutfits([newOutfit, ...outfits]);
      setLastCapturedImage(null);
    } else {
      console.error("No image URI provided for outfit");
    }
  };

  // Mock data for streak and recent outfits
  const weekDays = ["M", "T", "W", "Th", "F", "Sa", "Su"];
  const currentDay = 2; // Wednesday (0-indexed)
  
  // Helper function to get relative time
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Get emoji based on score
  const getScoreEmoji = (score: number) => {
    if (score <= 20) return "😢";
    if (score <= 40) return "😕";
    if (score <= 60) return "😊";
    if (score <= 80) return "😃";
    return "🔥";
  };
  
  const renderStepCard = (step: typeof STEPS[0], index: number) => (
    <View key={step.id} style={styles.stepWrapper}>
      <Animated.View
        style={[
          styles.stepCard,
          {
            opacity: stepsAnimatedValues[index],
            transform: [{
              translateY: stepsAnimatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.stepContent}
          onPress={index === 0 ? handleCameraPress : step.action}
          activeOpacity={0.8}
        >
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{step.id}</Text>
          </View>
          <FontAwesome name={step.icon} size={24} color="#000000" style={styles.stepIcon} />
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </TouchableOpacity>
      </Animated.View>
      {index < STEPS.length - 1 && (
        <View style={styles.stepConnector}>
          {/* Remove dots between steps */}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.logo}>FitcheckAI</Text>
        <View style={styles.streakContainer}>
          <FontAwesome name="fire" size={20} color="#FF6B00" />
          <Text style={styles.streakCount}>{streakCount}</Text>
        </View>
      </View>
      
      {/* Calendar Week View */}
      <View style={styles.calendarContainer}>
        <View style={styles.weekDays}>
          {lastSevenDays.map((date) => {
            const inStreak = isDateInStreak(date);
            const isCurrentDay = isToday(date);
            return (
              <View
                key={date.toISOString()}
                style={[
                  styles.dayCircle,
                  inStreak && styles.completedDay,
                  isCurrentDay && styles.currentDay
                ]}
              >
                <Text style={[
                  styles.dayText,
                  (inStreak || isCurrentDay) && { color: '#000000' }
                ]}>
                  {formatDayLabel(date)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Three Steps Section */}
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>How it works</Text>
        <View style={styles.stepsContent}>
          {STEPS.map((step, index) => renderStepCard(step, index))}
        </View>
      </View>
      
      {/* Recently Logged Section */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recently logged</Text>
        
        {outfits.length === 0 && !loadingOutfit ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No outfits yet. Take a photo to get started!
            </Text>
          </View>
        ) : (
          <View>
            {loadingOutfit && (
              <View style={styles.recentOutfitCard}>
                <View style={styles.loadingImageContainer}>
                  <Image source={{ uri: loadingOutfit.imageUri }} style={styles.recentOutfitImage} />
                  <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCircle}>
                      <Animated.View style={[
                        styles.loadingSpinner,
                        {
                          transform: [{
                            rotate: spinAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg']
                            })
                          }]
                        }
                      ]} />
                      <Text style={styles.loadingPercentage}>{loadingOutfit.progress}%</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.recentOutfitInfo}>
                  <Text style={styles.loadingTitle}>Finalizing results...</Text>
                  <Text style={styles.loadingSubtext}>We'll notify you when done!</Text>
                </View>
              </View>
            )}
            
            {outfits.map((outfit) => (
              <TouchableOpacity 
                key={outfit.id} 
                style={styles.recentOutfitCard}
                onPress={() => {
                  router.push({
                    pathname: "/results" as any,
                    params: { 
                      outfitId: outfit.id,
                      imageUri: outfit.imageUri,
                      category: outfit.category,
                      gender: outfit.gender,
                      score: outfit.score.toString(),
                      timestamp: outfit.timestamp,
                      feedback: outfit.feedback || '',
                      // We can't pass complex objects directly, so we'll stringify them
                      details: outfit.details ? JSON.stringify(outfit.details) : '',
                      suggestions: outfit.suggestions ? JSON.stringify(outfit.suggestions) : ''
                    }
                  });
                }}
              >
                <Image source={{ uri: outfit.imageUri }} style={styles.recentOutfitImage} />
                <View style={styles.recentOutfitInfo}>
                  <View style={styles.recentOutfitHeader}>
                    <Text style={styles.recentOutfitCategory}>{outfit.category}</Text>
                    <Text style={styles.recentOutfitTime}>{getRelativeTime(outfit.timestamp)}</Text>
                  </View>
                  <View style={styles.recentOutfitScore}>
                    <Text style={styles.recentOutfitScoreText}>{getScoreEmoji(outfit.score)}</Text>
                    <Text style={styles.recentOutfitScoreTotal}>{outfit.score}/100</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      {/* Outfit Selection Modal */}
      {selectionModalVisible && (
        <OutfitSelectionModal
          visible={selectionModalVisible}
          onClose={handleCloseModal}
          onSubmit={handleSubmitSelection}
          imageUri={lastCapturedImage || undefined}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  calendarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
  },
  currentDay: {
    backgroundColor: "#FFE0CC",
    borderWidth: 2,
    borderColor: "#FF6B00",
  },
  completedDay: {
    backgroundColor: "#FFE0CC",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
  },
  stepsContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  stepsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  stepCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepContent: {
    padding: 16,
    alignItems: "center",
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepIcon: {
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  stepConnector: {
    height: 10,
    width: 1,
    backgroundColor: 'transparent',
    marginVertical: 0,
    alignSelf: 'center',
  },
  recentSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  recentOutfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 80,
  },
  recentOutfitImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  recentOutfitInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  recentOutfitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentOutfitCategory: {
    fontSize: 16,
    fontWeight: "600",
  },
  recentOutfitTime: {
    fontSize: 14,
    color: "#999999",
  },
  recentOutfitScore: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentOutfitScoreText: {
    fontSize: 20,
    marginRight: 8,
  },
  recentOutfitScoreTotal: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#666666',
  },
  loadingProgressBar: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  loadingImageContainer: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#000',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  loadingPercentage: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
