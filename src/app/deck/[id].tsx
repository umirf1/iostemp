import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Flashcard, FlashcardDeck } from '@/types/flashcards';

// Mock data for flashcard sets (this would come from your storage in a real app)
const MOCK_FLASHCARD_SETS: FlashcardDeck[] = [
  { 
    id: '1', 
    title: 'Productivity Tips', 
    description: 'Tips to improve your productivity',
    count: 12,
    isDefault: true,
    enableForQuiz: true
  },
  { 
    id: '2', 
    title: 'General Knowledge', 
    description: 'Test your general knowledge',
    count: 20,
    isDefault: true,
    enableForQuiz: true
  },
  { 
    id: '3', 
    title: 'My Custom Cards', 
    description: 'My personal flashcards',
    count: 5,
    isDefault: false,
    enableForQuiz: false
  },
];

// Mock flashcard data
const MOCK_FLASHCARDS: Flashcard[] = [
  { id: '1', question: 'What is the Pomodoro Technique?', answer: 'A time management method using 25-minute work intervals followed by short breaks.', deckId: '1' },
  { id: '2', question: 'What is the 2-minute rule?', answer: 'If a task takes less than 2 minutes, do it immediately rather than scheduling it for later.', deckId: '1' },
  { id: '3', question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci', deckId: '2' },
  { id: '4', question: 'What is the capital of Japan?', answer: 'Tokyo', deckId: '2' },
  { id: '5', question: 'My favorite book?', answer: 'To Kill a Mockingbird', deckId: '3' },
];

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Pure black and white color scheme
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    card: isDark ? '#222222' : '#F5F5F5',
    primary: isDark ? '#FFFFFF' : '#000000',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#444444' : '#DDDDDD',
    placeholder: isDark ? '#888888' : '#AAAAAA',
  };

  // State for deck and flashcards
  const [deck, setDeck] = useState<FlashcardDeck | undefined>(undefined);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // State for new flashcard
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Load deck and flashcards
  useEffect(() => {
    if (id) {
      const deckId = Array.isArray(id) ? id[0] : id;
      const foundDeck = MOCK_FLASHCARD_SETS.find(d => d.id === deckId);
      
      if (foundDeck) {
        setDeck(foundDeck);
        setDeckTitle(foundDeck.title);
        setDeckDescription(foundDeck.description);
        
        // Load flashcards for this deck
        const deckFlashcards = MOCK_FLASHCARDS.filter(f => f.deckId === deckId);
        setFlashcards(deckFlashcards);
      }
    }
  }, [id]);

  // Save deck title and description
  const saveDeckDetails = () => {
    if (!deck) return;
    
    // In a real app, you would save this to your storage
    setDeck({
      ...deck,
      title: deckTitle,
      description: deckDescription
    });
    
    setIsEditing(false);
    Alert.alert('Success', 'Deck details updated');
  };

  // Add a new flashcard
  const addFlashcard = () => {
    if (!newQuestion.trim() || !newAnswer.trim() || !deck) {
      Alert.alert('Error', 'Please enter both question and answer');
      return;
    }
    
    const newCard: Flashcard = {
      id: Date.now().toString(), // Simple ID generation
      question: newQuestion,
      answer: newAnswer,
      deckId: deck.id
    };
    
    // Add to state (in a real app, save to storage)
    const updatedFlashcards = [...flashcards, newCard];
    setFlashcards(updatedFlashcards);
    
    // Update deck count
    setDeck({
      ...deck,
      count: updatedFlashcards.length
    });
    
    // Clear form
    setNewQuestion('');
    setNewAnswer('');
    
    Alert.alert('Success', 'Flashcard added');
  };

  // Delete a flashcard
  const deleteFlashcard = (cardId: string) => {
    Alert.alert(
      'Delete Flashcard',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (!deck) return;
            
            const updatedFlashcards = flashcards.filter(f => f.id !== cardId);
            setFlashcards(updatedFlashcards);
            
            // Update deck count
            setDeck({
              ...deck,
              count: updatedFlashcards.length
            });
          }
        }
      ]
    );
  };

  // Render a flashcard item
  const renderFlashcard = ({ item }: { item: Flashcard }) => (
    <View style={[styles.flashcardItem, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View>
        <Text style={[styles.questionText, { color: colors.text }]}>Q: {item.question}</Text>
        <Text style={[styles.answerText, { color: colors.text }]}>A: {item.answer}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteFlashcard(item.id)}>
        <Ionicons name="trash-outline" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  if (!deck) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Deck not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Deck' : deck.title,
          headerRight: () => (
            isEditing ? (
              <TouchableOpacity onPress={saveDeckDetails}>
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>Edit</Text>
              </TouchableOpacity>
            )
          )
        }}
      />
      
      {/* Deck Details Section */}
      <View style={styles.deckDetailsSection}>
        {isEditing ? (
          <>
            <TextInput
              style={[styles.titleInput, { borderColor: colors.border, color: colors.text }]}
              value={deckTitle}
              onChangeText={setDeckTitle}
              placeholder="Deck Title"
              placeholderTextColor={colors.placeholder}
              maxLength={50}
            />
            <TextInput
              style={[styles.descriptionInput, { borderColor: colors.border, color: colors.text }]}
              value={deckDescription}
              onChangeText={setDeckDescription}
              placeholder="Deck Description"
              placeholderTextColor={colors.placeholder}
              maxLength={100}
              multiline
            />
          </>
        ) : (
          <>
            <Text style={[styles.deckTitle, { color: colors.text }]}>{deck.title}</Text>
            <Text style={[styles.deckDescription, { color: colors.text }]}>{deck.description}</Text>
            <Text style={[styles.deckStats, { color: colors.text }]}>
              {deck.count} cards • {deck.isDefault ? 'Default Deck' : 'Custom Deck'}
            </Text>
          </>
        )}
      </View>
      
      {/* Flashcards Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>FLASHCARDS</Text>
      </View>
      
      {/* Flashcard List */}
      <FlatList
        data={flashcards}
        renderItem={renderFlashcard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.flashcardList}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={[styles.emptyListText, { color: colors.text }]}>
              No flashcards in this deck yet. Add your first flashcard below.
            </Text>
          </View>
        }
      />
      
      {/* Add New Flashcard Form */}
      <View style={[styles.addCardSection, { borderColor: colors.border }]}>
        <Text style={[styles.addCardTitle, { color: colors.text }]}>ADD NEW FLASHCARD</Text>
        
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Question"
          placeholderTextColor={colors.placeholder}
          value={newQuestion}
          onChangeText={setNewQuestion}
          multiline
        />
        
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Answer"
          placeholderTextColor={colors.placeholder}
          value={newAnswer}
          onChangeText={setNewAnswer}
          multiline
        />
        
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addFlashcard}
        >
          <Text style={[styles.addButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
            Add Flashcard
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    textAlign: 'center',
    marginTop: 16,
  },
  deckDetailsSection: {
    marginVertical: 16,
  },
  deckTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  deckDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  deckStats: {
    fontSize: 14,
    opacity: 0.8,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  descriptionInput: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: 60,
  },
  sectionHeader: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  flashcardList: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  flashcardItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  addCardSection: {
    padding: 16,
    borderTopWidth: 1,
    marginTop: 'auto',
  },
  addCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
  },
  addButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
}); 