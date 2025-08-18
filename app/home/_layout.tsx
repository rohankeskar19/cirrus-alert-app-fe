import React from "react";

import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { Tabs } from "expo-router";

import AlertsTabIcon from "@/assets/icons/alerts-tab.svg";
import HomeTabIcon from "@/assets/icons/home-tab.svg";
import SettingsTabIcon from "@/assets/icons/settings-tab.svg";
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale, verticalScale } from "@/utils/metrics";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const tabBackground = useThemeColor("tabBackground");
  const background = useThemeColor("background");
  const textColor = useThemeColor("textColor");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].accentColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            height: verticalScale(75),
            position: "absolute",
            backgroundColor: background,
            paddingTop: verticalScale(13),
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            borderTopColor: "transparent",
          },
          default: {
            height: verticalScale(75),
            position: "absolute",
            backgroundColor: background,
            paddingTop: verticalScale(13),
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            borderTopColor: "transparent",
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.tabButton,
                { backgroundColor: focused ? tabBackground : "transparent" },
              ]}
            >
              <HomeTabIcon color={textColor} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.tabButton,
                { backgroundColor: focused ? tabBackground : "transparent" },
              ]}
            >
              <AlertsTabIcon color={textColor} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.tabButton,
                { backgroundColor: focused ? tabBackground : "transparent" },
              ]}
            >
              <SettingsTabIcon color={textColor} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(11),

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
