import React from "react";

import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { Tabs } from "expo-router";

import HomeTabIcon from "@/assets/icons/home-tab.svg";
import SettingsTabIcon from "@/assets/icons/settings-tab.svg";
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { moderateScale, verticalScale } from "@/utils/metrics";

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
            backgroundColor: "#ffffff",
            paddingTop: verticalScale(13),
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            borderTopColor: "#EBEBEB",
            borderTopWidth: 2,
          },
          default: {
            height: verticalScale(75),
            position: "absolute",
            backgroundColor: "#ffffff",
            paddingTop: verticalScale(13),
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            borderTopColor: "#EBEBEB",
            borderTopWidth: 2,
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
                { borderColor: focused ? "#B07CFF" : "transparent" },
              ]}
            >
              <HomeTabIcon />
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
                { borderColor: focused ? "#B07CFF" : "transparent" },
              ]}
            >
              <SettingsTabIcon />
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
    borderWidth: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
