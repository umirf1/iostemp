import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

// Mock data for flashcard sets
const MOCK_FLASHCARD_SETS = [
  { 
    id: '1', 
    title: 'Productivity Tips', 
    description: 'Tips to improve your productivity',
    count: 12,
    isDefault: true
  },
  { 
    id: '2', 
    title: 'General Knowledge', 
    description: 'Test your general knowledge',
    count: 20,
    isDefault: true
  },
  { 
    id: '3', 
    title: 'My Custom Cards', 
    description: 'My personal flashcards',
    count: 5,
    isDefault: false
  },
];

export default function FlashcardsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    card: isDark ? '#000000' : '#FFFFFF',
    primary: isDark ? '#FFFFFF' : '#000000',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#FFFFFF' : '#000000',
  };

  const [flashcardSets, setFlashcardSets] = useState(MOCK_FLASHCARD_SETS);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'custom'

  const filteredSets = activeTab === 'all' 
    ? flashcardSets 
    : flashcardSets.filter(set => !set.isDefault);

  const renderFlashcardSet = ({ item }: { item: typeof MOCK_FLASHCARD_SETS[0] }) => (
    <TouchableOpacity 
      style={[styles.flashcardSet, { borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.flashcardSetHeader}>
        <Text style={[styles.flashcardSetTitle, { color: colors.text }]}>{item.title}</Text>
        {item.isDefault && (
          <View style={[styles.defaultBadge, { borderColor: colors.border }]}>
            <Text style={[styles.defaultBadgeText, { color: colors.text }]}>DEFAULT</Text>
          </View>
        )}
      </View>
      <Text style={[styles.flashcardSetDescription, { color: colors.text }]}>
        {item.description}
      </Text>
      <View style={styles.flashcardSetFooter}>
        <Text style={[styles.flashcardCount, { color: colors.text }]}>
          {item.count} cards
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Text style={[styles.headerTitle, { color: colors.text }]}>FLASHCARDS</Text>
      <Text style={[styles.headerSubtitle, { color: colors.text }]}>
        Answer questions to bypass delay screens
      </Text>
      
      {/* Tabs */}
      <View style={[styles.tabContainer, { borderColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'all' && [styles.activeTab, { borderColor: colors.border }]
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: colors.text, fontWeight: activeTab === 'all' ? '700' : '400' }
            ]}
          >
            ALL SETS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'custom' && [styles.activeTab, { borderColor: colors.border }]
          ]}
          onPress={() => setActiveTab('custom')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: colors.text, fontWeight: activeTab === 'custom' ? '700' : '400' }
            ]}
          >
            MY CUSTOM SETS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Flashcard Sets */}
      <FlatList
        data={filteredSets}
        renderItem={renderFlashcardSet}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No flashcard sets found.
            </Text>
          </View>
        }
      />

      {/* Add New Set Button */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={isDark ? '#000000' : '#FFFFFF'} />
      </TouchableOpacity>

      {/* Flashcard Usage Info */}
      <View style={[styles.infoCard, { borderColor: colors.border }]}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle-outline" size={22} color={colors.text} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>FLASHCARD BYPASS</Text>
        </View>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Answer flashcard questions correctly to bypass the delay screen when opening controlled apps.
        </Text>
        <View style={[styles.bypassCounter, { borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.bypassCounterText, { color: colors.text }]}>
            3 BYPASSES REMAINING TODAY
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  listContainer: {
    paddingBottom: 100, // Extra space for the floating button
  },
  flashcardSet: {
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  flashcardSetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flashcardSetTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  flashcardSetDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  flashcardSetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flashcardCount: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 48,
    height: 48,
    borderRadius: 0,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1,
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 16,
  },
  bypassCounter: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  bypassCounterText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
}); 