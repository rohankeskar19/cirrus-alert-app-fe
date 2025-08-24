import React, { useEffect, useState } from "react";

import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { Tabs } from "expo-router";

import AlertsTabIcon from "@/assets/icons/alerts-tab.svg";
import HomeTabIcon from "@/assets/icons/home-tab.svg";
import SettingsTabIcon from "@/assets/icons/settings-tab.svg";
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fetchUnreadAlertReports, supabase } from "@/utils/apiUtils";
import { moderateScale, verticalScale } from "@/utils/metrics";

export default function TabLayout() {
  const [unreadReportsCount, setUnreadReportsCount] = useState(0);
  const colorScheme = useColorScheme();

  const tabBackground = useThemeColor("tabBackground");
  const background = useThemeColor("background");
  const textColor = useThemeColor("textColor");
  const accentColor = useThemeColor("accentColor");

  useEffect(() => {
    let subscription: any;

    const setupSubscription = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;
      const userId = session.user.id;

      fetchAlertReports();

      subscription = supabase
        .channel("alert-reports-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "alert_reports",
            filter: `alert_reports.user_id=eq.${userId}`,
          },
          async (payload) => {
            console.log("Realtime change in alert_reports:", payload);

            fetchAlertReports();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const fetchAlertReports = async () => {
    try {
      const reports = await fetchUnreadAlertReports();

      setUnreadReportsCount(reports.length);
    } catch (error) {
      console.error("Error fetching alert reports:", error);
    }
  };

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
              {unreadReportsCount > 0 && (
                <View
                  style={[
                    styles.unreadBubble,
                    { backgroundColor: accentColor },
                  ]}
                ></View>
              )}

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
  unreadBubble: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(100),
    position: "absolute",
    right: 3,
    top: 5,
  },
});
