import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import React, { useState } from "react";
import { Animated, Easing, TouchableOpacity } from "react-native";

const CirrusSwitch = ({
  isOn = false,
  onToggle = (state: boolean) => {},
  size = "medium",
  activeColor = "#ADEC56",
}) => {
  const thumbColor = useThemeColor("background");
  const inactiveColor = useThemeColor("placeholderGray");

  const [switchValue] = useState(new Animated.Value(isOn ? 1 : 0));

  const sizes = {
    small: {
      width: horizontalScale(40),
      height: verticalScale(22),
      thumbSize: moderateScale(18),
      padding: moderateScale(4),
    },
    medium: {
      width: horizontalScale(50),
      height: verticalScale(28),
      thumbSize: moderateScale(23),
      padding: moderateScale(4),
    },
    large: {
      width: horizontalScale(60),
      height: verticalScale(34),
      thumbSize: moderateScale(30),
      padding: moderateScale(4),
    },
  } as any;

  const config = sizes[size];
  const thumbOffset = config.width - config.thumbSize - config.padding * 2;

  const toggleSwitch = () => {
    const newValue = !isOn;
    onToggle(newValue);

    Animated.timing(switchValue, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };

  const backgroundColorInterpolation = switchValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const thumbTranslateX = switchValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, thumbOffset],
  });

  return (
    <TouchableOpacity
      onPress={toggleSwitch}
      activeOpacity={1}
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Animated.View
        style={{
          width: config.width,
          height: config.height,
          borderRadius: moderateScale(5),
          backgroundColor: backgroundColorInterpolation,
          justifyContent: "center",
          padding: config.padding,
        }}
      >
        <Animated.View
          style={{
            width: config.thumbSize,
            height: config.thumbSize,
            borderRadius: moderateScale(5),
            backgroundColor: thumbColor,
            transform: [{ translateX: thumbTranslateX }],
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default CirrusSwitch;
