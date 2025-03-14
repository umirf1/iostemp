import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Sample data for the template
const SAMPLE_CATEGORIES = [
  { id: '1', name: 'Category 1', count: 5 },
  { id: '2', name: 'Category 2', count: 8 },
  { id: '3', name: 'Category 3', count: 3 },
  { id: '4', name: 'Category 4', count: 6 },
];

const SAMPLE_ITEMS = [
  { id: '1', title: 'Item 1', category: '1', date: '2023-05-15' },
  { id: '2', title: 'Item 2', category: '1', date: '2023-05-20' },
  { id: '3', title: 'Item 3', category: '2', date: '2023-06-01' },
  { id: '4', title: 'Item 4', category: '2', date: '2023-06-05' },
  { id: '5', title: 'Item 5', category: '3', date: '2023-06-10' },
  { id: '6', title: 'Item 6', category: '1', date: '2023-06-15' },
  { id: '7', title: 'Item 7', category: '2', date: '2023-06-20' },
  { id: '8', title: 'Item 8', category: '4', date: '2023-06-25' },
  { id: '9', title: 'Item 9', category: '4', date: '2023-07-01' },
];

export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on selected category
  const filteredItems = selectedCategory
    ? SAMPLE_ITEMS.filter(item => item.category === selectedCategory)
    : SAMPLE_ITEMS;

  // Get category name by id
  const getCategoryName = (categoryId: string) => {
    const category = SAMPLE_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Collection</Text>
        <TouchableOpacity style={styles.filterButton}>
          <FontAwesome name="sliders" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.selectedCategoryChip
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === null && styles.selectedCategoryChipText
          ]}>All</Text>
        </TouchableOpacity>

        {SAMPLE_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.selectedCategoryChipText
            ]}>{category.name} ({category.count})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items Grid */}
      <ScrollView style={styles.itemsContainer}>
        <View style={styles.itemsGrid}>
          {filteredItems.map(item => (
            <TouchableOpacity key={item.id} style={styles.itemCard}>
              <View style={styles.itemImagePlaceholder}>
                <FontAwesome name="image" size={24} color="#999" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemCategory}>{getCategoryName(item.category)}</Text>
                <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty state if no items */}
        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome name="folder-open-o" size={48} color="#999" />
            <Text style={styles.emptyStateTitle}>No items found</Text>
            <Text style={styles.emptyStateDescription}>
              Items you add will appear here
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add button */}
      <TouchableOpacity style={[styles.addButton, { bottom: insets.bottom + 80 }]}>
        <FontAwesome name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#000000',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  itemCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
  },
  itemImagePlaceholder: {
    height: 150,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#999999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 