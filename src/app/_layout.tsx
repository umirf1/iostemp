import "expo-dev-client";
import "../../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen as ExpoSplashScreen, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Platform } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { MigrationProvider } from "@/lib/db/MigrationProvider";
import { isOnboardingComplete, resetOnboardingStatus } from "@/lib/onboarding";

// Conditionally import RevenueCat
let initializePurchases: () => void;
try {
  // Only import if we're not in Expo Go
  if (!(Platform as any).isExpoGo) {
    const purchases = require("@/lib/purchases");
    initializePurchases = purchases.initializePurchases;
  } else {
    initializePurchases = () => console.log("RevenueCat not initialized in Expo Go");
  }
} catch (error) {
  console.warn("RevenueCat initialization skipped:", error);
  initializePurchases = () => console.log("RevenueCat not available");
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// We'll handle the initial route dynamically based on onboarding status
export const unstable_settings = {
  // No initialRouteName here, we'll set it dynamically
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initialize RevenueCat if available
try {
  initializePurchases();
} catch (error) {
  console.warn("Failed to initialize RevenueCat:", error);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Check if onboarding is complete
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // For testing: Uncomment to reset onboarding status
        // await resetOnboardingStatus();
        
        const onboardingComplete = await isOnboardingComplete();
        
        if (onboardingComplete) {
          setInitialRoute("(tabs)");
        } else {
          setInitialRoute("onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setInitialRoute("onboarding");
      }
    };

    checkOnboarding();
  }, []);

  // Don't render until we know the initial route
  if (!initialRoute) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <MigrationProvider>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { 
              backgroundColor: '#fff'
            },
            animation: 'fade',
          }}
          initialRouteName={initialRoute}
        >
          <Stack.Screen 
            name="onboarding" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          <Stack.Screen 
            name="subscription" 
            options={{ 
              headerShown: false,
              animation: 'slide_from_right',
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="sheet"
            options={{
              presentation: "formSheet",
              sheetCornerRadius: 20,
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.3, 1.0],
            }}
          />
          <Stack.Screen 
            name="camera" 
            options={{ 
              headerShown: false,
              presentation: "fullScreenModal"
            }} 
          />
          <Stack.Screen 
            name="category-select" 
            options={{ 
              headerShown: false,
              presentation: "card",
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="analysis" 
            options={{ 
              headerShown: false,
              animation: "fade"
            }} 
          />
          <Stack.Screen 
            name="results" 
            options={{ 
              headerShown: false,
              animation: "fade"
            }} 
          />
        </Stack>
      </MigrationProvider>
    </ThemeProvider>
  );
}
