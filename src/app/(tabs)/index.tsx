import { StyleSheet, TouchableOpacity, Image, ScrollView, View, Animated } from "react-native";
import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useRef, useEffect } from "react";

const STEPS = [
  {
    id: 1,
    icon: "camera-retro" as const,
    title: "Capture",
    description: "Take a photo of your outfit",
    action: () => router.push("/camera")
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

export default function HomeScreen() {
  const fadeAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;
  
  useEffect(() => {
    Animated.stagger(200, 
      fadeAnims.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        })
      )
    ).start();
  }, []);

  // Mock data for streak and recent outfits
  const streakCount = 1;
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDay = 2; // Wednesday (0-indexed)
  
  const recentOutfits = []; // Empty for now to show empty state
  
  // Navigate to camera screen
  const handleUploadPress = () => {
    router.push("/camera");
  };
  
  const renderStepCard = (step: typeof STEPS[0], index: number) => (
    <View key={step.id} style={styles.stepWrapper}>
      <Animated.View
        style={[
          styles.stepCard,
          {
            opacity: fadeAnims[index],
            transform: [{
              translateY: fadeAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.stepContent}
          onPress={step.action}
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
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
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
                key={index} 
                style={[
                  styles.dayCircle,
                  isCurrent && styles.currentDay,
                  isCompleted && styles.completedDay,
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
        
        {recentOutfits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You haven't uploaded any outfits
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Start tracking today's style by taking a quick picture.
            </Text>
          </View>
        ) : (
          <View>
            {/* Outfit cards will go here when we have data */}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
    borderWidth: 2,
    borderColor: "#DDDDDD",
    borderStyle: "dotted",
    justifyContent: "center",
    alignItems: "center",
  },
  currentDay: {
    borderColor: "#FF6B00",
    borderStyle: "solid",
  },
  completedDay: {
    borderStyle: "solid",
    borderColor: "#4CAF50",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
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
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepContent: {
    padding: 12,
    alignItems: "center",
  },
  stepNumber: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  stepIcon: {
    marginTop: 12,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
  },
  stepConnector: {
    width: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  stepDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#DDDDDD',
  },
  recentSection: {
    padding: 16,
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
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
});
