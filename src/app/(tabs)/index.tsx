import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Image, ScrollView, View, Animated, Platform } from "react-native";
import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
// Import the components
import OutfitSelectionModal from "@/components/OutfitSelectionModal";
import LoadingOverlay from "@/components/LoadingOverlay";

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
  const stepsAnimatedValues = useRef(STEPS.map(() => new Animated.Value(0))).current;
  
  // Check for captured image from camera
  useEffect(() => {
    if (params.capturedImage) {
      console.log("Captured image received:", params.capturedImage);
      setLastCapturedImage(params.capturedImage as string);
      setSelectionModalVisible(true);
    }
  }, [params.capturedImage]);

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

  const handleCameraPress = () => {
    router.push("/camera" as any);
  };

  const handleCloseModal = () => {
    setSelectionModalVisible(false);
  };

  const handleSubmitSelection = (category: string, gender: string) => {
    console.log("Selection submitted:", { category, gender });
    setSelectedCategory(category);
    setSelectedGender(gender);
    setSelectionModalVisible(false);
    setLoadingVisible(true);
  };

  const handleAnalysisComplete = (score: number) => {
    setLoadingVisible(false);
    
    // Add the new outfit to the list
    if (lastCapturedImage) {
      const newOutfit: OutfitData = {
        id: Date.now().toString(),
        imageUri: lastCapturedImage,
        category: selectedCategory,
        gender: selectedGender,
        score: score,
        timestamp: new Date().toISOString()
      };
      
      setOutfits([newOutfit, ...outfits]);
      setLastCapturedImage(null);
    }
  };

  // Mock data for streak and recent outfits
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
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
          {weekDays.map((day, index) => {
            const isCompleted = index < currentDay;
            const isCurrent = index === currentDay;
            return (
              <View
                key={day}
                style={[
                  styles.dayCircle,
                  isCompleted && styles.completedDay,
                  isCurrent && styles.currentDay
                ]}
              >
                <Text style={[
                  styles.dayText,
                  (isCompleted || isCurrent) && { color: '#000000' }
                ]}>
                  {day}
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
        
        {outfits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No outfits yet. Take a photo to get started!
            </Text>
          </View>
        ) : (
          <View>
            {outfits.map((outfit) => (
              <TouchableOpacity 
                key={outfit.id} 
                style={styles.recentOutfitCard}
                onPress={() => {
                  router.push({
                    pathname: "/results" as any,
                    params: { outfitId: outfit.id }
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
      
      {/* Loading Overlay */}
      {loadingVisible && (
        <LoadingOverlay
          visible={loadingVisible}
          imageUri={lastCapturedImage || undefined}
          onComplete={handleAnalysisComplete}
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 14,
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
  },
  recentOutfitImage: {
    width: 100,
    height: "100%",
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
});
