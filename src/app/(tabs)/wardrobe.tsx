import { useState } from "react";
import { StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Platform, View as RNView } from "react-native";
import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// Mock data for outfit history
const MOCK_OUTFITS = [
  {
    id: "outfit1",
    imageUri: "https://picsum.photos/300/400?random=1",
    timestamp: "2023-06-15T14:30:00Z",
    category: "Streetwear",
    overallScore: 85,
    metrics: {
      style: 80,
      trend: 90,
      creativity: 85
    }
  },
  {
    id: "outfit2",
    imageUri: "https://picsum.photos/300/400?random=2",
    timestamp: "2023-06-14T10:15:00Z",
    category: "Business Casual",
    overallScore: 92,
    metrics: {
      style: 95,
      trend: 88,
      creativity: 90
    }
  },
  {
    id: "outfit3",
    imageUri: "https://picsum.photos/300/400?random=3",
    timestamp: "2023-06-12T18:45:00Z",
    category: "Minimalist",
    overallScore: 78,
    metrics: {
      style: 82,
      trend: 75,
      creativity: 70
    }
  }
];

// Sort options
const SORT_OPTIONS = [
  { id: "recent", label: "Recent" },
  { id: "oldest", label: "Oldest" },
  { id: "highest", label: "Highest Rated" }
];

export default function WardrobeScreen() {
  const [selectedSort, setSelectedSort] = useState("recent");
  const [outfits, setOutfits] = useState(MOCK_OUTFITS);
  
  // Get emoji based on score
  const getScoreEmoji = (score: number) => {
    if (score <= 20) return "😢";
    if (score <= 40) return "😕";
    if (score <= 60) return "😊";
    if (score <= 80) return "😃";
    return "🔥";
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };
  
  // Get feedback message based on score
  const getFeedbackMessage = (score: number) => {
    if (score <= 20) return "Tap for personalized style tips to improve";
    if (score <= 40) return "Click to see how to level up your look";
    if (score <= 60) return "See what makes this a good foundation";
    if (score <= 80) return "Tap to see what makes this outfit work";
    return "See what makes this outfit amazing";
  };
  
  // Handle sorting
  const handleSort = (sortOption: string) => {
    setSelectedSort(sortOption);
    
    let sortedOutfits = [...MOCK_OUTFITS];
    
    switch(sortOption) {
      case "recent":
        sortedOutfits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case "oldest":
        sortedOutfits.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case "highest":
        sortedOutfits.sort((a, b) => b.overallScore - a.overallScore);
        break;
    }
    
    setOutfits(sortedOutfits);
  };
  
  // Render outfit card
  const renderOutfitCard = ({ item }: { item: typeof MOCK_OUTFITS[0] }) => (
    <TouchableOpacity style={styles.outfitCard}>
      <Image source={{ uri: item.imageUri }} style={styles.outfitImage} />
      <View style={styles.outfitInfo}>
        <View style={styles.outfitHeader}>
          <Text style={styles.outfitCategory}>{item.category}</Text>
          <Text style={styles.outfitDate}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <RNView style={styles.scoreLabelContainer}>
            <Text style={styles.scoreEmoji}>{getScoreEmoji(item.overallScore)}</Text>
            <Text style={styles.scoreLabel}>Score:</Text>
          </RNView>
          <RNView style={styles.scoreValueContainer}>
            <Text style={styles.scoreValue}>{item.overallScore}</Text>
            <Text style={styles.scoreTotal}>/100</Text>
          </RNView>
        </View>
        <RNView style={styles.feedbackContainer}>
          <Text style={styles.feedbackMessage}>{getFeedbackMessage(item.overallScore)}</Text>
          <FontAwesome name="chevron-right" size={14} color="#666666" />
        </RNView>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wardrobe</Text>
      
      {/* Sort Options */}
      <RNView style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <RNView style={styles.sortOptions}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                selectedSort === option.id && styles.sortOptionSelected
              ]}
              onPress={() => handleSort(option.id)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  selectedSort === option.id && styles.sortOptionTextSelected
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </RNView>
      </RNView>
      
      {/* Outfit List */}
      <FlatList
        data={outfits}
        renderItem={renderOutfitCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.outfitList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sortContainer: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: '#000000',
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: 'transparent',
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#999999",
  },
  sortOptionSelected: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  sortOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  outfitList: {
    paddingBottom: 16,
  },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outfitImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  outfitInfo: {
    padding: 16,
  },
  outfitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  outfitCategory: {
    fontSize: 16,
    fontWeight: "600",
  },
  outfitDate: {
    fontSize: 14,
    color: "#999999",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  scoreLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scoreValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scoreTotal: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 1,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingRight: 4,
  },
  feedbackMessage: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
    fontStyle: "italic",
  },
}); 