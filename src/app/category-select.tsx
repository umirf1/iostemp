import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CATEGORIES = [
  { id: 'casual', label: 'Casual Wear', icon: 'smile-o' },
  { id: 'formal', label: 'Formal Wear', icon: 'black-tie' },
  { id: 'streetwear', label: 'Streetwear', icon: 'street-view' },
  { id: 'athletic', label: 'Athletic Wear', icon: 'futbol-o' },
  { id: 'business', label: 'Business Casual', icon: 'briefcase' },
  { id: 'evening', label: 'Evening Wear', icon: 'star' },
  { id: 'beachwear', label: 'Beachwear', icon: 'sun-o' },
  { id: 'outerwear', label: 'Outerwear', icon: 'cloud' },
];

export default function CategorySelectScreen() {
  const params = useLocalSearchParams<{ imageUri: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    console.log('Category select screen mounted with params:', params);
    if (params.imageUri) {
      console.log('Image URI from params:', params.imageUri);
      setImageUri(params.imageUri);
    }
  }, [params]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (imageUri) {
      router.push({
        pathname: '/analysis' as any,
        params: { 
          imageUri,
          category: categoryId
        }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <FontAwesome name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Category</Text>
      </View>

      {/* Image Preview */}
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.imagePreview}
          resizeMode="cover"
        />
      )}

      {/* Categories Grid */}
      <ScrollView 
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardSelected
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            <FontAwesome 
              name={category.icon as any} 
              size={32} 
              color={selectedCategory === category.id ? "#FFFFFF" : "#000000"} 
            />
            <Text style={[
              styles.categoryLabel,
              selectedCategory === category.id && styles.categoryLabelSelected
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  categoriesContainer: {
    flex: 1,
  },
  categoriesContent: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardSelected: {
    backgroundColor: '#000000',
  },
  categoryLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
  },
}); 