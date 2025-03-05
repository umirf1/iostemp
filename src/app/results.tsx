import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';

// Mock data for outfit analysis
const generateMockAnalysis = (score: number, category: string) => {
  // Adjust feedback based on score range
  let feedback = {
    pros: [
      "Great color coordination",
      "Well-fitted silhouette",
      "Excellent accessory choices"
    ],
    cons: [
      "Shoes don't match the overall style",
      "Too many competing patterns"
    ],
    suggestions: [
      "Try a more minimal shoe to balance the outfit",
      "Consider a solid-colored top to let the patterned bottom stand out"
    ]
  };
  
  // Adjust metrics based on score
  const metrics = {
    style: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
    trend: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
    creativity: Math.min(100, score + Math.floor(Math.random() * 10) - 5)
  };
  
  return { score, metrics, feedback, category };
};

export default function ResultsScreen() {
  const { imageUri, category, score: scoreParam } = useLocalSearchParams<{ 
    imageUri: string; 
    category: string;
    score: string;
  }>();
  
  const score = parseInt(scoreParam || '85', 10);
  const analysis = generateMockAnalysis(score, category || 'Streetwear');
  
  // Handle sharing results
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my outfit! FitcheckAI gave me a score of ${score}/100 for my ${category} look.`,
        // url: imageUri // Uncomment if you want to share the image
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  // Handle returning to home
  const handleDone = () => {
    router.replace('/');
  };
  
  // Handle fix results
  const handleFixResults = () => {
    // In a real app, this would allow the user to provide feedback
    // For now, just return to home
    router.replace('/');
  };
  
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Outfit Image */}
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.outfitImage}
          resizeMode="cover"
        />
      )}
      
      {/* Category and Timestamp */}
      <View style={styles.header}>
        <Text style={styles.category}>{analysis.category}</Text>
        <Text style={styles.timestamp}>{new Date().toLocaleDateString()}</Text>
      </View>
      
      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <Text style={styles.scoreValue}>{analysis.score}<Text style={styles.scoreMax}>/100</Text></Text>
      </View>
      
      {/* Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Style</Text>
          <Text style={styles.metricValue}>{analysis.metrics.style}</Text>
          <View style={styles.metricBar}>
            <View 
              style={[
                styles.metricFill, 
                { width: `${analysis.metrics.style}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Trend</Text>
          <Text style={styles.metricValue}>{analysis.metrics.trend}</Text>
          <View style={styles.metricBar}>
            <View 
              style={[
                styles.metricFill, 
                { width: `${analysis.metrics.trend}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Creativity</Text>
          <Text style={styles.metricValue}>{analysis.metrics.creativity}</Text>
          <View style={styles.metricBar}>
            <View 
              style={[
                styles.metricFill, 
                { width: `${analysis.metrics.creativity}%` }
              ]} 
            />
          </View>
        </View>
      </View>
      
      {/* Fashion Score */}
      <View style={styles.fashionScoreContainer}>
        <View style={styles.fashionScoreHeader}>
          <FontAwesome name="heart" size={20} color="#FF6B00" />
          <Text style={styles.fashionScoreLabel}>Fashion Score</Text>
          <Text style={styles.fashionScoreValue}>{Math.floor(score / 20)}/10</Text>
        </View>
        <View style={styles.fashionScoreBar}>
          <View 
            style={[
              styles.fashionScoreFill, 
              { width: `${score}%` }
            ]} 
          />
        </View>
      </View>
      
      {/* Feedback */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Analysis</Text>
        
        {/* Pros */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackSectionTitle}>Pros</Text>
          {analysis.feedback.pros.map((pro, index) => (
            <View key={`pro-${index}`} style={styles.feedbackItem}>
              <View style={styles.proIcon}>
                <FontAwesome name="check" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.feedbackText}>{pro}</Text>
            </View>
          ))}
        </View>
        
        {/* Cons */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackSectionTitle}>Cons</Text>
          {analysis.feedback.cons.map((con, index) => (
            <View key={`con-${index}`} style={styles.feedbackItem}>
              <View style={styles.conIcon}>
                <FontAwesome name="times" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.feedbackText}>{con}</Text>
            </View>
          ))}
        </View>
        
        {/* Suggestions */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackSectionTitle}>Suggestions</Text>
          {analysis.feedback.suggestions.map((suggestion, index) => (
            <View key={`suggestion-${index}`} style={styles.feedbackItem}>
              <View style={styles.suggestionIcon}>
                <FontAwesome name="lightbulb-o" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.feedbackText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.fixButton]}
          onPress={handleFixResults}
        >
          <Text style={styles.fixButtonText}>Fix Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <FontAwesome name="share" size={16} color="#FFFFFF" style={styles.shareIcon} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.doneButton}
        onPress={handleDone}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  outfitImage: {
    width: '100%',
    height: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 14,
    color: '#999999',
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: 'normal',
    color: '#999999',
  },
  metricsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  metricCard: {
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  metricBar: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  fashionScoreContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  fashionScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fashionScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  fashionScoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fashionScoreBar: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fashionScoreFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 4,
  },
  feedbackContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  proIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  conIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  fixButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
  },
  fixButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
  },
  shareIcon: {
    marginRight: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 