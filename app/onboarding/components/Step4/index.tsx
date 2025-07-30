import ClockIcon from "@/assets/icons/clock.svg";
import { useScreenTime } from "@/hooks/useScreenTime";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DAYS_OF_WEEK } from "@/utils/constants";
import { moderateScale, verticalScale } from "@/utils/metrics";

import dayjs from "dayjs";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Image, StyleSheet, Text, View } from "react-native";

const Step4 = () => {
  // Sample data - replace with real data later
  const { screenTimeData, detailedAppUsage } = useScreenTime();

  const onBackgroundColor = useThemeColor("onBackground");
  const onQuestStatColor = useThemeColor("questStat");

  const weeklyData = [
    { day: "M", usage: 2.5, isToday: false }, // 2.5 hours
    { day: "T", usage: 4.2, isToday: false }, // 4.2 hours
    { day: "W", usage: 1.8, isToday: false }, // 1.8 hours
    { day: "Th", usage: 3.1, isToday: false }, // 3.1 hours
    { day: "F", usage: 1.5, isToday: false }, // 1.5 hours
    { day: "Sa", usage: 6.8, isToday: false }, // 6.8 hours
    { day: "S", usage: 5.2, isToday: true }, // 5.2 hours (today)
  ];

  const apps = [
    { name: "Instagram", time: "3h 45m", color: "#E4405F" },
    { name: "YouTube", time: "2h 30m", color: "#FF0000" },
    { name: "WhatsApp", time: "1h 15m", color: "#25D366" },
    { name: "Chrome", time: "45m", color: "#4285F4" },
    { name: "Spotify", time: "30m", color: "#1DB954" },
  ];

  const totalTime = "5h 20m";
  const maxUsage = Math.max(...weeklyData.map((d) => d.usage));

  const getBarHeight = (usage: number) => {
    const maxHeight = moderateScale(120);
    return (usage / maxUsage) * maxHeight;
  };

  const getBarColor = (isToday: boolean, usage: number) => {
    if (isToday) return "#FF6B6B";
    return usage > 4 ? "#FF9999" : "#87CEEB";
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.totalUsageContainer}>
        <ClockIcon color={onBackgroundColor} />
        <Text style={[{ color: onBackgroundColor }, styles.totalUsageTime]}>
          {totalTime}
        </Text>
      </View>
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {screenTimeData?.dailyData.map((data, index) => (
            <View key={index} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height: getBarHeight(data.totalScreenTime / 3600),
                    // backgroundColor: getBarColor(data., data.usage),
                  },
                ]}
              />
              <Text style={styles.dayLabel}>
                {DAYS_OF_WEEK[dayjs(data.date).day()].label}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.horizontalLine} />
      </View>

      <View style={styles.appsSection}>
        <Text style={styles.appsSectionTitle}>
          <FormattedMessage id="most_distracting_apps" />
        </Text>
        {detailedAppUsage?.apps.slice(0, 5).map((app, index) => (
          <View key={index} style={styles.appItem}>
            <View style={styles.appIconContainer}>
              <Image
                source={{ uri: app.appIcon }}
                style={styles.appIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{app.appName}</Text>
              <Text style={styles.appTime}>{app.totalTimeInForeground}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: verticalScale(34),
    paddingHorizontal: moderateScale(20),
  },
  totalUsageContainer: {
    alignItems: "center",
    marginBottom: verticalScale(30),
  },
  totalUsageTime: {
    fontSize: moderateScale(30),
    fontFamily: "Outfit-SemiBold",
  },
  chartContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: verticalScale(40),
    position: "relative",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "85%",
    height: moderateScale(140),
    paddingBottom: moderateScale(25),
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: moderateScale(4),
  },
  bar: {
    width: moderateScale(24),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(8),
    minHeight: moderateScale(20),
  },
  dayLabel: {
    fontSize: moderateScale(14),
    color: "#FFFFFF",
    fontWeight: "500",
    fontFamily: "Outfit-Medium",
  },
  horizontalLine: {
    position: "absolute",
    bottom: moderateScale(20),
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: moderateScale(30),
  },
  appsSection: {
    flex: 1,
    width: "100%",
  },
  appsSectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: verticalScale(20),
    fontFamily: "Outfit-SemiBold",
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(4),
  },
  appIcon: {
    width: moderateScale(43),
    height: moderateScale(43),
  },
  appIconContainer: {
    marginRight: moderateScale(16),
  },
  appIconPlaceholder: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
  },
  appInfo: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  appName: {
    fontSize: moderateScale(16),
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: verticalScale(2),
    fontFamily: "Outfit-Medium",
  },
  appTime: {
    fontSize: moderateScale(14),
    color: "#FF9999",
    fontFamily: "Outfit-Regular",
  },
});

export default Step4;
