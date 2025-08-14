import React, { useEffect, useState } from "react";

import { StatusBar, useColorScheme } from "react-native";

import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { IntlProvider } from "react-intl";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Provider } from "react-redux";

import { getCurrentUser } from "@/utils/apiUtils";
import { SCREEN_BACKGROUNDS, THEMES } from "@/utils/constants";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import store from "../store";
import messages from "../translations/en.json";

export const ThemeContext = React.createContext(THEMES.LIGHT);

export default function RootLayout() {
  const [theme, setTheme] = useState(THEMES.LIGHT);
  const [redirectRoute, setRedirectRoute] = useState<
    "/splash" | "/welcome" | "/home"
  >("/splash");
  const scheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    "SpaceGrotesk-Light": require("@/assets/fonts/space_grotesk_light.ttf"),
    "SpaceGrotesk-Bold": require("@/assets/fonts/space_grotesk_bold.ttf"),
    "SpaceGrotesk-Medium": require("@/assets/fonts/space_grotesk_medium.ttf"),
    "SpaceGrotesk-Regular": require("@/assets/fonts/space_grotesk_regular.ttf"),
    "SpaceGrotesk-SemiBold": require("@/assets/fonts/space_grotesk_semibold.ttf"),
    "Inter-Regular": require("@/assets/fonts/inter_regular.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/inter_semibold.ttf"),
    "Inter-Bold": require("@/assets/fonts/inter_bold.ttf"),
  });

  useEffect(() => {
    const hideSplash = async () => {
      handleAuthNavigation();
    };

    if (fontsLoaded) {
      hideSplash();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    StatusBar.setBackgroundColor(getBackground(theme));
    StatusBar.setBarStyle(getBarStyle(theme));
  }, [theme]);

  const handleAuthNavigation = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setRedirectRoute("/home");
      } else {
        setRedirectRoute("/welcome");
      }
      await SplashScreen.hideAsync();
    } catch (err) {
      setRedirectRoute("/welcome");
      await SplashScreen.hideAsync();
    }
  };

  const getBarStyle = (theme: string) => {
    if (theme === THEMES.AUTO) {
      return scheme === "dark" ? "light-content" : "dark-content";
    } else if (theme === THEMES.LIGHT) {
      return "dark-content";
    } else {
      return "light-content";
    }
  };

  const getBackground = (theme: string) => {
    if (theme === THEMES.AUTO) {
      return scheme === "dark"
        ? SCREEN_BACKGROUNDS.DARK
        : SCREEN_BACKGROUNDS.LIGHT;
    } else if (theme === THEMES.LIGHT) {
      return SCREEN_BACKGROUNDS.LIGHT;
    } else {
      return SCREEN_BACKGROUNDS.DARK;
    }
  };

  const themeData = { theme, setTheme };

  if (!fontsLoaded) return;

  return (
    <Provider store={store}>
      <ThemeContext.Provider value={themeData as any}>
        <GestureHandlerRootView>
          <IntlProvider locale="en" defaultLocale="en" messages={messages}>
            <BottomSheetModalProvider>
              <Stack
                initialRouteName="welcome/index"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="welcome/index" />
                <Stack.Screen name="onboarding/index" />
                <Stack.Screen name="signup/index" />
                <Stack.Screen name="signup/form/index" />
                <Stack.Screen name="login/index" />
                <Stack.Screen name="forgot-password/index" />
                <Stack.Screen name="home" />
                <Stack.Screen name="splash/index" />
              </Stack>
              {redirectRoute && <Redirect href={redirectRoute}></Redirect>}
            </BottomSheetModalProvider>
          </IntlProvider>
        </GestureHandlerRootView>
      </ThemeContext.Provider>
    </Provider>
  );
}
