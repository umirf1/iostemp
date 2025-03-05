import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { Camera as ExpoCamera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Outfit categories from app documentation
const OUTFIT_CATEGORIES = [
  "Streetwear",
  "Formalwear",
  "Business Casual",
  "Smart Casual",
  "Techwear",
  "Athleisure",
  "Minimalist",
  "Y2K / Trendy"
];

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.back);
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const [showTips, setShowTips] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(OUTFIT_CATEGORIES[0]);
  const cameraRef = useRef<any>(null);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handle taking a photo
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      processImage(photo.uri);
    }
  };

  // Handle selecting from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  // Process the image and navigate to analysis screen
  const processImage = (uri: string) => {
    // Navigate to analysis screen with image URI and category
    router.push({
      pathname: '/analysis' as any,
      params: { 
        imageUri: uri,
        category: selectedCategory
      }
    });
  };

  // Close the camera screen
  const handleClose = () => {
    router.back();
  };

  // Toggle flash mode
  const toggleFlash = () => {
    setFlashMode(
      flashMode === 'off'
        ? 'on'
        : 'off'
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Camera View */}
      <ExpoCamera 
        style={styles.camera} 
        type={type as any}
        flashMode={flashMode as any}
        ref={cameraRef}
      >
        {/* Frame Guide */}
        <View style={styles.frameGuide}>
          <View style={styles.frameCorner} />
          <View style={[styles.frameCorner, styles.topRight]} />
          <View style={[styles.frameCorner, styles.bottomLeft]} />
          <View style={[styles.frameCorner, styles.bottomRight]} />
        </View>
        
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <FontAwesome name="times" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpButton} onPress={() => setShowTips(true)}>
            <FontAwesome name="question" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {OUTFIT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <FontAwesome 
                name={flashMode === 'on' ? "flash" : "bolt"} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <FontAwesome name="image" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ExpoCamera>
      
      {/* Tips Modal */}
      <Modal
        visible={showTips}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Best outfit capture practices</Text>
            
            <View style={styles.tipsSection}>
              <View style={styles.tipHeader}>
                <View style={styles.tipIconContainer}>
                  <FontAwesome name="check" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.tipHeaderText}>Do</Text>
              </View>
              
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Capture your full outfit in good lighting</Text>
                <Text style={styles.tipItem}>• Stand against a neutral background</Text>
                <Text style={styles.tipItem}>• Include shoes in the frame</Text>
              </View>
            </View>
            
            <View style={styles.tipsSection}>
              <View style={styles.tipHeader}>
                <View style={[styles.tipIconContainer, styles.dontIcon]}>
                  <FontAwesome name="times" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.tipHeaderText}>Don't</Text>
              </View>
              
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Take blurry or poorly lit photos</Text>
                <Text style={styles.tipItem}>• Crop out parts of your outfit</Text>
                <Text style={styles.tipItem}>• Take photos at odd angles</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowTips(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  frameGuide: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  frameCorner: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
  },
  topRight: {
    left: undefined,
    right: 40,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    top: undefined,
    bottom: 200,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    top: undefined,
    left: undefined,
    right: 40,
    bottom: 200,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  categoryContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginHorizontal: 4,
  },
  categoryButtonSelected: {
    backgroundColor: '#FFFFFF',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#000000',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  flashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  tipsSection: {
    width: '100%',
    marginBottom: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dontIcon: {
    backgroundColor: '#F44336',
  },
  tipHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  tipsList: {
    paddingLeft: 8,
  },
  tipItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  modalButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 