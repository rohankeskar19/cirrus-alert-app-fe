import ClockIcon from "@/assets/icons/clock.svg";
import { formatScreenTime, useScreenTime } from "@/hooks/useScreenTime";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DAYS_OF_WEEK } from "@/utils/constants";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

import dayjs from "dayjs";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Image, StyleSheet, Text, View } from "react-native";

const Step4 = () => {
  const { screenTimeData, detailedAppUsage } = useScreenTime();

  const onBackgroundColor = useThemeColor("onBackground");
  const questStatColor = useThemeColor("questStat");
  const redColor = useThemeColor("redColor");
  const accentColor = useThemeColor("accentColor");
  const averageLine = useThemeColor("averageLine");

  const averageScreenTime = React.useMemo(() => {
    if (!screenTimeData?.dailyData || screenTimeData.dailyData.length === 0) {
      return 0;
    }
    const total = screenTimeData.dailyData.reduce(
      (sum, data) => sum + data.totalScreenTime,
      0
    );
    return total / screenTimeData.dailyData.length;
  }, [screenTimeData]);

  const sortedDailyData = React.useMemo(() => {
    if (!screenTimeData?.dailyData) return [];
    return [...screenTimeData.dailyData].sort((a, b) =>
      dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1
    );
  }, [screenTimeData?.dailyData]);

  const getBarHeight = (usage: number) => {
    if (screenTimeData) {
      const maxUsage =
        screenTimeData?.dailyData.sort(
          (a, b) => b.totalScreenTime - a.totalScreenTime
        )[0]?.totalScreenTime / 3600 || 1;

      const maxHeight = verticalScale(140);

      return Math.min((usage / maxUsage) * maxHeight, verticalScale(140));
    }

    return moderateScale(20);
  };

  const getAverageLinePosition = () => {
    if (!screenTimeData?.dailyData) {
      return 0;
    }
    const maxUsage =
      screenTimeData?.dailyData.sort(
        (a, b) => b.totalScreenTime - a.totalScreenTime
      )[0]?.totalScreenTime / 3600 || 1;

    const maxHeight = verticalScale(140);

    const averageInHours = averageScreenTime / 3600;

    return Math.min(
      (averageInHours / maxUsage) * maxHeight,
      verticalScale(140)
    );
  };

  const getBarColor = (usage: number) => {
    return usage > averageScreenTime ? redColor : accentColor;
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.totalUsageContainer}>
        <ClockIcon color={onBackgroundColor} />
        <Text style={[{ color: onBackgroundColor }, styles.totalUsageTime]}>
          {formatScreenTime(screenTimeData?.totalScreenTime || 0)}
        </Text>
      </View>
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {sortedDailyData.map((data, index) => {
            return (
              <View style={styles.barColumnContainer} key={index}>
                <View
                  style={[
                    styles.barColumn,
                    { backgroundColor: questStatColor },
                  ]}
                >
                  <View
                    style={[
                      {
                        height: getBarHeight(data.totalScreenTime / 3600),
                        backgroundColor: getBarColor(data.totalScreenTime),
                      },
                      styles.bar,
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>
                  {DAYS_OF_WEEK[dayjs(data.date).day()].label}
                </Text>
              </View>
            );
          })}
        </View>
        <View
          style={[{ backgroundColor: questStatColor }, styles.horizontalLine]}
        />

        <View
          style={[
            {
              bottom: moderateScale(25) + getAverageLinePosition(),
            },
            styles.averageLine,
            { borderTopColor: averageLine },
          ]}
        />
      </View>

      <View style={styles.appsSection}>
        <Text style={[{ color: onBackgroundColor }, styles.appsSectionTitle]}>
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
              <Text style={[styles.appName, { color: onBackgroundColor }]}>
                {app.appName}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ClockIcon
                  color={onBackgroundColor}
                  width={moderateScale(17)}
                  height={moderateScale(17)}
                />
                <Text style={[{ color: onBackgroundColor }, styles.appTime]}>
                  {formatScreenTime(app.totalTimeInForeground)}
                </Text>
              </View>
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
  },
  totalUsageContainer: {
    alignItems: "center",
    marginBottom: verticalScale(30),
    flexDirection: "row",
  },
  totalUsageTime: {
    fontSize: moderateScale(30),
    fontFamily: "Outfit-SemiBold",
    marginLeft: horizontalScale(15),
  },
  chartContainer: {
    width: "90%",
    alignItems: "center",
    marginBottom: verticalScale(33),
    position: "relative",
  },
  barColumnContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "85%",
    height: verticalScale(140),
  },
  barColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    height: verticalScale(140),
    marginHorizontal: moderateScale(4),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(20),
    overflow: "hidden",
  },
  bar: {
    width: moderateScale(16),
    borderRadius: moderateScale(4),
    maxHeight: verticalScale(140),
  },
  dayLabel: {
    fontSize: moderateScale(14),
    color: "#FFFFFF",
    fontWeight: "500",
    fontFamily: "Outfit-Medium",
  },
  horizontalLine: {
    width: "101%",
    position: "absolute",
    bottom: moderateScale(25),
    borderRadius: 100,
    height: 3,
    marginHorizontal: moderateScale(30),
  },
  averageLine: {
    width: "101%",
    position: "absolute",
    borderTopWidth: 4,
    borderStyle: "dashed",
  },
  appsSection: {
    width: "100%",
    paddingBottom: verticalScale(20),
  },
  appsSectionTitle: {
    fontSize: moderateScale(20),
    marginBottom: verticalScale(15),
    fontFamily: "Outfit-Medium",
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
  },
  appIcon: {
    width: moderateScale(43),
    height: moderateScale(43),
  },
  appIconContainer: {
    marginRight: moderateScale(18),
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
    fontFamily: "Outfit-Regular",
    marginLeft: horizontalScale(6),
  },
});

export default Step4;
