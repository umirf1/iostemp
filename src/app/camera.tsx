import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions, FlashMode, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  // Get safe area insets for proper layout
  const insets = useSafeAreaInsets();
  
  // Get category from route params if available
  const { category } = useLocalSearchParams<{ category: string }>();
  
  // Camera state
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      if (!mediaLibraryPermission?.granted) {
        await requestMediaLibraryPermission();
      }
    })();
  }, [cameraPermission, mediaLibraryPermission, requestCameraPermission, requestMediaLibraryPermission]);

  // Handle when camera is ready
  const onCameraReady = () => {
    console.log('Camera is ready');
    setIsCameraReady(true);
  };

  // Take a picture
  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady) return;
    
    try {
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Capture the image
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      
      if (photo && photo.uri) {
        // Set the captured image
        setCapturedImage(photo.uri);
        
        // Trigger success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        console.log('Photo taken:', photo.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      
      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Pick an image from the library
  const pickImage = async () => {
    try {
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Request permission if needed
      if (!mediaLibraryPermission?.granted) {
        const permission = await requestMediaLibraryPermission();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Please grant access to your photo library to select images.');
          return;
        }
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Set the selected image
        setCapturedImage(result.assets[0].uri);
        
        // Trigger success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      
      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Save the captured image to the device and proceed to analysis
  const savePicture = async () => {
    if (!capturedImage || !mediaLibraryPermission?.granted) {
      if (!mediaLibraryPermission?.granted) {
        const permission = await requestMediaLibraryPermission();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Please grant access to your photo library to save images.');
          return;
        }
      }
      return;
    }
    
    try {
      // Save the image to media library
      const asset = await MediaLibrary.createAssetAsync(capturedImage);
      console.log('Picture saved to library:', asset);
      
      // Trigger success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Log the navigation attempt
      console.log('Navigating to home tab with captured image:', asset.uri);
      
      // Navigate directly to the home tab with the captured image URI
      // First close the camera screen
      router.back();
      
      // Then after a short delay, navigate to the home tab with the image
      setTimeout(() => {
        router.replace({
          pathname: '/(tabs)' as any,
          params: { capturedImage: asset.uri }
        });
      }, 300);
    } catch (error) {
      console.error('Error saving picture:', error);
      Alert.alert('Error', 'Failed to save picture. Please try again.');
      
      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Discard the captured image and return to camera
  const retakePicture = () => {
    setCapturedImage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Toggle camera type (front/back)
  const toggleCameraType = () => {
    setFacing(current => (
      current === 'back' ? 'front' : 'back'
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Toggle flash mode
  const toggleFlash = () => {
    setFlash(current => (
      current === 'off' ? 'on' : 'off'
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Close camera and go back
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Closing camera and returning to home');
    
    // Navigate back to the home tab without any parameters
    router.replace({
      pathname: '/(tabs)' as any
    });
  };

  // Show loading state while checking permissions
  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.text}>Requesting camera permissions...</Text>
      </View>
    );
  }

  // Show error if camera permission denied
  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.text}>Camera access denied</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { marginTop: 10 }]}
          onPress={handleClose}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show preview if image is captured
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Image preview */}
        <Image 
          source={{ uri: capturedImage }} 
          style={styles.preview}
        />
        
        {/* Controls overlay */}
        <View style={[styles.controlsOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={retakePicture}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.usePhotoButton}
              onPress={() => {
                // First save the picture
                savePicture();
                
                // Then close the camera screen
                setTimeout(() => {
                  handleClose();
                }, 300);
              }}
            >
              <Text style={styles.usePhotoText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Main camera view
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Camera component */}
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        ref={cameraRef}
        onCameraReady={onCameraReady}
      >
        {/* Camera UI overlay */}
        <View style={[styles.cameraOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleClose}
            >
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={toggleFlash}
            >
              <Ionicons 
                name={flash === 'on' ? "flash" : "flash-off"} 
                size={28} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          
          {/* Framing guide */}
          <View style={styles.framingGuide}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          
          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomBarContent}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={pickImage}
              >
                <Ionicons name="images" size={28} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={takePicture}
                disabled={!isCameraReady}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={toggleCameraType}
              >
                <Ionicons name="camera-reverse" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
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
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  bottomBar: {
    padding: 20,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  usePhotoButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'center',
  },
  usePhotoText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  framingGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: 60,
    left: 40,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cornerTR: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 60,
    right: 40,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
}); 