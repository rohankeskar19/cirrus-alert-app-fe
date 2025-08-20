import React from "react";

import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { Animated, StyleSheet, View } from "react-native";

const ShimmerAlertCard = () => {
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
      <View style={styles.shimmerHeader}>
        <Animated.View
          style={[
            styles.shimmerTitle,
            shimmerStyle,
            { backgroundColor: placeholderGray + "40" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerSwitch,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
      </View>

      <View style={styles.shimmerMeta}>
        <Animated.View
          style={[
            styles.shimmerBadge,
            shimmerStyle,
            { backgroundColor: placeholderGray + "50" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerDate,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
      </View>

      <View style={styles.shimmerSources}>
        <Animated.View
          style={[
            styles.shimmeralertSource,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmeralertSource,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmeralertSource,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
      </View>

      <View style={styles.shimmerActions}>
        <Animated.View
          style={[
            styles.shimmerButton,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerButton,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  shimmerCard: {
    borderRadius: moderateScale(5),
    borderWidth: 1,
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
  },
  shimmerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(16),
  },
  shimmerTitle: {
    height: moderateScale(20),
    borderRadius: moderateScale(4),
    flex: 1,
    marginRight: horizontalScale(16),
  },
  shimmerSwitch: {
    width: moderateScale(44),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
  },
  shimmerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  shimmerBadge: {
    width: moderateScale(60),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
  },
  shimmerDate: {
    width: moderateScale(80),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  shimmerSources: {
    flexDirection: "row",
    gap: horizontalScale(8),
    marginBottom: verticalScale(16),
  },
  shimmeralertSource: {
    width: moderateScale(50),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
  },
  shimmerActions: {
    flexDirection: "row",
    gap: horizontalScale(12),
  },
  shimmerButton: {
    flex: 1,
    height: moderateScale(36),
    borderRadius: moderateScale(16),
  },
});

export default ShimmerAlertCard;
