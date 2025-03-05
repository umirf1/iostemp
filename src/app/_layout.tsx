import "expo-dev-client";
import "../../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { MigrationProvider } from "@/lib/db/MigrationProvider";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <MigrationProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
