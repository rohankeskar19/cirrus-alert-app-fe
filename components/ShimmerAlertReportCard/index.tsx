import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

const ShimmerAlertReportCard = () => {
  const backgroundColor = useThemeColor("background");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");

  const shimmerValue = new Animated.Value(0);

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const shimmerStyle = {
    opacity: shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={[styles.shimmerCard, { backgroundColor, borderColor }]}>
      <View style={styles.shimmerImageContainer}>
        <Animated.View
          style={[
            styles.shimmerImage,
            shimmerStyle,
            { backgroundColor: placeholderGray + "40" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerAlertTag,
            shimmerStyle,
            { backgroundColor: placeholderGray + "60" },
          ]}
        />
      </View>
      <View style={styles.shimmerContent}>
        <Animated.View
          style={[
            styles.shimmerTitle,
            shimmerStyle,
            { backgroundColor: placeholderGray + "50" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerTitleSecond,
            shimmerStyle,
            { backgroundColor: placeholderGray + "40" },
          ]}
        />

        <View style={styles.shimmerMetadata}>
          <Animated.View
            style={[
              styles.shimmerTime,
              shimmerStyle,
              { backgroundColor: placeholderGray + "30" },
            ]}
          />
          <Animated.View
            style={[
              styles.shimmerStats,
              shimmerStyle,
              { backgroundColor: placeholderGray + "30" },
            ]}
          />
        </View>

        <View style={styles.shimmerFooter}>
          <View style={styles.shimmerSources}>
            <Animated.View
              style={[
                styles.shimmerSourceIcon,
                shimmerStyle,
                { backgroundColor: placeholderGray + "40" },
              ]}
            />
            <Animated.View
              style={[
                styles.shimmerSourceIcon,
                shimmerStyle,
                { backgroundColor: placeholderGray + "40" },
              ]}
            />
            <Animated.View
              style={[
                styles.shimmerSourceIcon,
                shimmerStyle,
                { backgroundColor: placeholderGray + "40" },
              ]}
            />
          </View>
          <Animated.View
            style={[
              styles.shimmerButton,
              shimmerStyle,
              { backgroundColor: placeholderGray + "30" },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {},
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(16),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Bold",
    flex: 1,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: horizontalScale(8),
  },
  headerActionButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: horizontalScale(20),
    marginBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(13),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(100),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    marginHorizontal: horizontalScale(12),
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
  },
  statsText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
  statsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  unreadBadgeText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
  selectionBar: {
    height: verticalScale(64),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    marginHorizontal: horizontalScale(20),
    marginVertical: verticalScale(12),
    borderRadius: moderateScale(16),
    borderWidth: 1,
  },
  selectAllButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
  },
  selectAllText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  bulkActionButton: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
  },
  bulkActionText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  contentContainer: {
    paddingBottom: verticalScale(20),
  },
  reportItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(4),
  },
  selectionButton: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(16),
  },
  reportCardContainer: {
    flex: 1,
  },
  footerLoader: {
    alignItems: "center",
    paddingVertical: verticalScale(20),
    gap: verticalScale(8),
  },
  footerLoaderText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
  shimmerContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(8),
  },
  shimmerCard: {
    borderRadius: moderateScale(20),
    overflow: "hidden",
    marginBottom: verticalScale(20),
    borderWidth: 1,
  },
  shimmerImageContainer: {
    position: "relative",
    width: "100%",
    height: verticalScale(180),
  },
  shimmerImage: {
    width: "100%",
    height: "100%",
  },
  shimmerAlertTag: {
    position: "absolute",
    top: moderateScale(16),
    left: moderateScale(16),
    width: moderateScale(60),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
  },
  shimmerContent: {
    padding: moderateScale(20),
  },
  shimmerTitle: {
    height: moderateScale(24),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(8),
  },
  shimmerTitleSecond: {
    height: moderateScale(24),
    borderRadius: moderateScale(4),
    width: "70%",
    marginBottom: verticalScale(16),
  },
  shimmerMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  shimmerTime: {
    width: moderateScale(80),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  shimmerStats: {
    width: moderateScale(120),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  shimmerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shimmerSources: {
    flexDirection: "row",
    gap: horizontalScale(8),
  },
  shimmerSourceIcon: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
  },
  shimmerButton: {
    width: moderateScale(100),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Bold",
    letterSpacing: -0.3,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  filterSection: {
    marginVertical: verticalScale(20),
  },
  filterSectionTitle: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Bold",
    marginBottom: verticalScale(16),
    letterSpacing: -0.2,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    marginBottom: verticalScale(12),
  },
  filterOptionText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    flex: 1,
  },
  filterCountBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(8),
  },
  filterOptionCount: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    gap: horizontalScale(16),
  },
  clearButton: {
    flex: 1,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  applyButton: {
    flex: 1,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(100),
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
});

export default ShimmerAlertReportCard;
