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
    <View style={[styles.newsCard, { backgroundColor, borderColor }]}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Animated.View
          style={[
            styles.featuredImage,
            shimmerStyle,
            { backgroundColor: placeholderGray + "40" },
          ]}
        />
        {/* Source Credit Shimmer */}
        <View style={styles.sourceCredit}>
          <Animated.View
            style={[
              styles.sourceCreditFavicon,
              shimmerStyle,
              { backgroundColor: placeholderGray + "60" },
            ]}
          />
          <Animated.View
            style={[
              styles.sourceCreditText,
              shimmerStyle,
              { backgroundColor: placeholderGray + "50" },
            ]}
          />
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* News Title */}
        <Animated.View
          style={[
            styles.newsTitle,
            shimmerStyle,
            { backgroundColor: placeholderGray + "50" },
          ]}
        />
        <Animated.View
          style={[
            styles.newsTitleSecond,
            shimmerStyle,
            { backgroundColor: placeholderGray + "40" },
          ]}
        />

        {/* Alert Text */}
        <Animated.View
          style={[
            styles.alertTextTitle,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />

        {/* Metadata Row */}
        <View style={styles.metadataRow}>
          <Animated.View
            style={[
              styles.timeShimmer,
              shimmerStyle,
              { backgroundColor: placeholderGray + "30" },
            ]}
          />
          <Animated.View
            style={[
              styles.statsDivider,
              shimmerStyle,
              { backgroundColor: placeholderGray + "40" },
            ]}
          />
          <Animated.View
            style={[
              styles.statsShimmer,
              shimmerStyle,
              { backgroundColor: placeholderGray + "30" },
            ]}
          />
        </View>

        {/* Footer Row */}
        <View style={styles.footerRow}>
          <View style={styles.sourcesContainer}>
            <View style={styles.sourceIconsRow}>
              <Animated.View
                style={[
                  styles.sourceFavicon,
                  shimmerStyle,
                  { backgroundColor: placeholderGray + "40" },
                ]}
              />
              <Animated.View
                style={[
                  styles.sourceFavicon,
                  shimmerStyle,
                  { backgroundColor: placeholderGray + "40" },
                ]}
              />
              <Animated.View
                style={[
                  styles.sourceFavicon,
                  shimmerStyle,
                  { backgroundColor: placeholderGray + "40" },
                ]}
              />
            </View>
          </View>

          <Animated.View
            style={[
              styles.markReadButton,
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
  newsCard: {
    width: "100%",
    overflow: "hidden",
    marginBottom: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: verticalScale(180),
    marginBottom: verticalScale(11),
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(4),
  },
  sourceCredit: {
    position: "absolute",
    bottom: moderateScale(12),
    right: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
  },
  sourceCreditFavicon: {
    width: moderateScale(16),
    height: moderateScale(16),
    marginRight: horizontalScale(6),
    borderRadius: moderateScale(4),
  },
  sourceCreditText: {
    width: moderateScale(60),
    height: moderateScale(13),
    borderRadius: moderateScale(4),
  },
  cardContent: {},
  newsTitle: {
    height: moderateScale(26),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(4),
  },
  newsTitleSecond: {
    height: moderateScale(26),
    borderRadius: moderateScale(4),
    width: "70%",
    marginBottom: verticalScale(8),
  },
  alertTextTitle: {
    height: moderateScale(20),
    borderRadius: moderateScale(4),
    width: "50%",
    marginBottom: verticalScale(11),
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(20),
    gap: horizontalScale(12),
  },
  timeShimmer: {
    width: moderateScale(80),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
  },
  statsDivider: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: 100,
  },
  statsShimmer: {
    width: moderateScale(90),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourcesContainer: {
    flex: 1,
  },
  sourceIconsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceFavicon: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(100),
    marginRight: -horizontalScale(12),
  },
  markReadButton: {
    width: moderateScale(120),
    height: moderateScale(40),
    borderRadius: moderateScale(5),
  },
});

export default ShimmerAlertReportCard;
