import React, { useState } from "react";

import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

const Chip: React.FC<{
  label: string;
  active: boolean;
  icon?: React.ReactNode;
  onPress: () => void;
}> = ({ label, active, icon, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);
  const translateY = React.useRef(new Animated.Value(0)).current;
  const shadowOpacity = React.useRef(new Animated.Value(1)).current;

  const baseColor = active ? "#7CC8FF" : "#FFFFFF";
  const borderColor = active ? "#7CC8FF" : "#DCDCDC";
  const shadowColor = active ? "#4A90C1" : "#DCDCDC";
  const textColor = active ? "#FFFFFF" : "#3D3D3D";

  React.useEffect(() => {
    if (isPressed) {
      // Animate to pressed state
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 4,
          duration: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0,
          duration: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate back to normal state
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPressed]);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    onPress();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
    >
      <View style={styles.chipContainer}>
        <Animated.View
          style={[
            styles.chipShadow,
            { backgroundColor: shadowColor },
            { opacity: shadowOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.chip,
            { backgroundColor: baseColor, borderColor: borderColor },
            { transform: [{ translateY }] },
          ]}
        >
          {icon && <View style={styles.chipIcon}>{icon}</View>}
          <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(15),
  },
  chipContainer: {
    position: "relative",
    height: verticalScale(41),
    marginHorizontal: horizontalScale(5),
  },
  chipShadow: {
    position: "absolute",
    top: verticalScale(4),
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: moderateScale(100),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    height: "88%",
    borderRadius: moderateScale(100),
    borderWidth: 2,
  },
  chipIcon: {
    marginRight: horizontalScale(6),
  },
  chipText: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-SemiBold",
  },
});

export default Chip;
