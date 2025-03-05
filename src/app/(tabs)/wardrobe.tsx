import { useState } from "react";
import { StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// Mock data for outfit history
const MOCK_OUTFITS = [
  {
    id: "outfit1",
    imageUri: "https://via.placeholder.com/300x400",
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
    imageUri: "https://via.placeholder.com/300x400",
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
    imageUri: "https://via.placeholder.com/300x400",
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
  { id: "highest", label: "Highest Rated" },
  { id: "lowest", label: "Lowest Rated" }
];

export default function WardrobeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [outfits, setOutfits] = useState(MOCK_OUTFITS);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
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
      case "lowest":
        sortedOutfits.sort((a, b) => a.overallScore - b.overallScore);
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
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{item.overallScore}</Text>
        </View>
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Style</Text>
            <Text style={styles.metricValue}>{item.metrics.style}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Trend</Text>
            <Text style={styles.metricValue}>{item.metrics.trend}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Creativity</Text>
            <Text style={styles.metricValue}>{item.metrics.creativity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wardrobe</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search outfits..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortOptions}>
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
        </View>
      </View>
      
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
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  sortOptionSelected: {
    backgroundColor: "#000000",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#333333",
  },
  sortOptionTextSelected: {
    color: "#FFFFFF",
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
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
  },
}); 