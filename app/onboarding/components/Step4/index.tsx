import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

import React from "react";

import { StyleSheet, View } from "react-native";

const Step4 = () => {
  return <View style={styles.stepContainer}></View>;
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
