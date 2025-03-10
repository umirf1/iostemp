import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';

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

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    outfitId: string;
    imageUri: string;
    category: string;
    gender: string;
    score: string;
    timestamp: string;
    feedback?: string;
    details?: string;
    suggestions?: string;
  }>();
  
  const [outfit, setOutfit] = useState<OutfitData | null>(null);
  
  // Parse the params to create the outfit object
  useEffect(() => {
    if (!params.outfitId) return;
    
    try {
      // Parse details and suggestions if they exist
      let details: OutfitData['details'] | undefined;
      let suggestions: string[] | undefined;
      
      if (params.details) {
        try {
          details = JSON.parse(params.details);
        } catch (e) {
          console.error('Error parsing details:', e);
        }
      }
      
      if (params.suggestions) {
        try {
          suggestions = JSON.parse(params.suggestions);
        } catch (e) {
          console.error('Error parsing suggestions:', e);
        }
      }
      
      // Clean up feedback if it contains JSON
      let cleanFeedback = params.feedback || '';
      if (cleanFeedback.includes('```json') || cleanFeedback.includes('{')) {
        try {
          // Try to extract JSON from the feedback
          const jsonMatch = cleanFeedback.match(/```json\s*(\{.*\})\s*```|(\{.*\})/s);
          if (jsonMatch) {
            const jsonStr = (jsonMatch[1] || jsonMatch[2]).trim();
            const parsedJson = JSON.parse(jsonStr);
            
            // If we successfully parsed JSON, use its fields
            if (parsedJson.feedback) {
              cleanFeedback = parsedJson.feedback;
            }
            
            // If we have details in the JSON but not from params
            if (parsedJson.details && !details) {
              details = parsedJson.details;
            }
            
            // If we have suggestions in the JSON but not from params
            if (parsedJson.suggestions && (!suggestions || suggestions.length === 0)) {
              suggestions = parsedJson.suggestions;
            }
            
            // If we have a score in the JSON
            if (parsedJson.score && !params.score) {
              params.score = parsedJson.score.toString();
            }
          }
        } catch (e) {
          console.error('Error parsing JSON from feedback:', e);
          // Remove JSON formatting if parsing fails
          cleanFeedback = cleanFeedback.replace(/```json|```/g, '').trim();
        }
      }
      
      // Create the outfit object from params
      const outfitData: OutfitData = {
        id: params.outfitId,
        imageUri: params.imageUri,
        category: params.category,
        gender: params.gender,
        score: parseInt(params.score || '0', 10),
        timestamp: params.timestamp || new Date().toISOString(),
        feedback: cleanFeedback,
        details,
        suggestions
      };
      
      setOutfit(outfitData);
    } catch (error) {
      console.error('Error creating outfit from params:', error);
      
      // Fallback to a mock outfit if we can't parse the params
      const mockOutfit: OutfitData = {
        id: '1',
        imageUri: params.imageUri || 'https://example.com/image.jpg',
        category: params.category || 'Streetwear',
        gender: params.gender || 'other',
        score: parseInt(params.score || '85', 10),
        timestamp: params.timestamp || new Date().toISOString(),
        feedback: params.feedback || "Great outfit with nice color coordination.",
        details: {
          style: 87,
          fit: 75,
          color: 90,
          occasion: 82
        },
        suggestions: [
          "Try a more fitted top to balance the proportions",
          "Consider adding a statement accessory to elevate the look"
        ]
      };
      
      setOutfit(mockOutfit);
    }
  }, [params]);
  
  // Handle sharing results
  const handleShare = async () => {
    if (!outfit) return;
    
    try {
      await Share.share({
        message: `Check out my outfit! FitcheckAI gave me a score of ${outfit.score}/100 for my ${outfit.category} look.`,
        // url: outfit.imageUri // Uncomment if you want to share the image
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
  
  if (!outfit) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading outfit details...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Outfit Image */}
      {outfit.imageUri && (
        <Image 
          source={{ uri: outfit.imageUri }} 
          style={styles.outfitImage}
          resizeMode="cover"
        />
      )}
      
      {/* Category and Timestamp */}
      <View style={styles.header}>
        <Text style={styles.category}>{outfit.category}</Text>
        <Text style={styles.timestamp}>{new Date(outfit.timestamp).toLocaleDateString()}</Text>
      </View>
      
      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <Text style={styles.scoreValue}>{outfit.score}<Text style={styles.scoreMax}>/100</Text></Text>
      </View>
      
      {/* Metrics */}
      <View style={styles.metricsContainer}>
        {outfit.details?.style !== undefined && (
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Style</Text>
              <Text style={styles.metricValue}>{outfit.details.style}</Text>
            </View>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricFill, 
                  { width: `${outfit.details.style}%` }
                ]} 
              />
            </View>
          </View>
        )}
        
        {outfit.details?.fit !== undefined && (
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Fit</Text>
              <Text style={styles.metricValue}>{outfit.details.fit}</Text>
            </View>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricFill, 
                  { width: `${outfit.details.fit}%` }
                ]} 
              />
            </View>
          </View>
        )}
        
        {outfit.details?.color !== undefined && (
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Color</Text>
              <Text style={styles.metricValue}>{outfit.details.color}</Text>
            </View>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricFill, 
                  { width: `${outfit.details.color}%` }
                ]} 
              />
            </View>
          </View>
        )}
        
        {outfit.details?.occasion !== undefined && (
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Occasion</Text>
              <Text style={styles.metricValue}>{outfit.details.occasion}</Text>
            </View>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricFill, 
                  { width: `${outfit.details.occasion}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
      
      {/* Feedback */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Analysis</Text>
        
        {/* General Feedback */}
        {outfit.feedback && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackText}>
              {outfit.feedback.replace(/^\s*\{.*\}\s*$/s, '').trim()}
            </Text>
          </View>
        )}
        
        {/* Suggestions */}
        {outfit.suggestions && outfit.suggestions.length > 0 && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackSectionTitle}>Suggestions</Text>
            {outfit.suggestions.map((suggestion, index) => (
              <View key={`suggestion-${index}`} style={styles.feedbackItem}>
                <View style={styles.suggestionIcon}>
                  <FontAwesome name="lightbulb-o" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.feedbackText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: '100%',
  },
  outfitImage: {
    width: '100%',
    height: 450,
    backgroundColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  timestamp: {
    fontSize: 14,
    color: '#999999',
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333333',
  },
  scoreMax: {
    fontSize: 32,
    color: '#999999',
    fontWeight: 'normal',
  },
  metricsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 8,
  },
  metricCard: {
    marginBottom: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  metricBar: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  feedbackContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  feedbackItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    flex: 1,
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  fixButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  fixButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#333333',
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
    height: 48,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 24,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 