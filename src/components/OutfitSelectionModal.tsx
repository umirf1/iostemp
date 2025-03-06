import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  SafeAreaView
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Style categories
const CATEGORIES = [
  { id: 'casual', label: 'Casual Wear', icon: 'smile-o' },
  { id: 'formal', label: 'Formal Wear', icon: 'black-tie' },
  { id: 'streetwear', label: 'Streetwear', icon: 'street-view' },
  { id: 'athletic', label: 'Athletic Wear', icon: 'futbol-o' },
];

// Gender options
const GENDERS = [
  { id: 'male', label: 'Male', icon: 'male' },
  { id: 'female', label: 'Female', icon: 'female' },
  { id: 'other', label: 'Other', icon: 'user' },
];

interface OutfitSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (category: string, gender: string) => void;
  imageUri?: string;
}

export default function OutfitSelectionModal({ 
  visible, 
  onClose, 
  onSubmit,
  imageUri 
}: OutfitSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedCategory && selectedGender) {
      onSubmit(selectedCategory, selectedGender);
    }
  };

  const canSubmit = selectedCategory !== null && selectedGender !== null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Outfit Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Gender Selection */}
          <Text style={styles.sectionTitle}>Who is wearing this outfit?</Text>
          <View style={styles.genderContainer}>
            {GENDERS.map((gender) => (
              <TouchableOpacity
                key={gender.id}
                style={[
                  styles.genderOption,
                  selectedGender === gender.id && styles.selectedOption
                ]}
                onPress={() => setSelectedGender(gender.id)}
              >
                <FontAwesome 
                  name={gender.icon as any} 
                  size={24} 
                  color={selectedGender === gender.id ? "#FFFFFF" : "#000000"} 
                />
                <Text 
                  style={[
                    styles.optionLabel,
                    selectedGender === gender.id && styles.selectedLabel
                  ]}
                >
                  {gender.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Selection */}
          <Text style={styles.sectionTitle}>What style are you going for?</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedOption
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <FontAwesome 
                  name={category.icon as any} 
                  size={24} 
                  color={selectedCategory === category.id ? "#FFFFFF" : "#000000"} 
                />
                <Text 
                  style={[
                    styles.optionLabel,
                    selectedCategory === category.id && styles.selectedLabel
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              !canSubmit && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitButtonText}>Analyze My Outfit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 15,
  },
  selectedOption: {
    backgroundColor: '#000000',
  },
  optionLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 