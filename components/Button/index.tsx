import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale, verticalScale } from "@/utils/metrics";

const Button = ({
  children,
  type = "primary",
  icon,
  disabled = false,
  loading = false,
  style = {},
  onPress,
  ...props
}: {
  children: any;
  type: "primary" | "hollow" | "oauth" | "correct" | "wrong" | "help";
  icon?: any;
  disabled?: boolean;
  loading?: boolean;
  style: any;
  onPress: () => void;
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Create an animated value for the button translation
  const translateYAnimation = useRef(new Animated.Value(0)).current;

  // Create an animated value for shadow opacity
  const shadowOpacity = useRef(new Animated.Value(1)).current;

  let baseColors, shadowColors, textColor, borderColor;

  const backgroundColor = useThemeColor("background");
  const onBackgroundColor = useThemeColor("onBackground");
  const shadowColor = useThemeColor("shadowColor");
  const borderHollowColor = useThemeColor("borderHollow");

  switch (type) {
    case "primary":
      baseColors = { backgroundColor: onBackgroundColor };
      shadowColors = { backgroundColor: shadowColor };
      textColor = backgroundColor;
      borderColor = onBackgroundColor;
      break;
    case "hollow":
      baseColors = { backgroundColor: backgroundColor };
      shadowColors = { backgroundColor: borderHollowColor };
      textColor = onBackgroundColor;
      borderColor = borderHollowColor;
      break;
    case "oauth":
      baseColors = { backgroundColor: backgroundColor };
      shadowColors = { backgroundColor: borderHollowColor };
      textColor = onBackgroundColor;
      borderColor = borderHollowColor;
      break;
    case "correct":
      baseColors = { backgroundColor: "#8CE967" };
      shadowColors = { backgroundColor: "#75BF58" };
      textColor = "#FFFFFF";
      borderColor = "#8CE967";
      break;
    case "wrong":
      baseColors = { backgroundColor: "#E98567" };
      shadowColors = { backgroundColor: "#BF6758" };
      textColor = "#FFFFFF";
      borderColor = "#E98567";
      break;
    case "help":
      baseColors = { backgroundColor: "#F0FFC0" };
      shadowColors = { backgroundColor: "#D6E3A9" };
      textColor = "#000000";
      borderColor = "#F0FFC0";
      break;
    default:
      baseColors = { backgroundColor: "#B07CFF" };
      shadowColors = { backgroundColor: "#9566DB" };
      textColor = "#FFFFFF";
      borderColor = "#B07CFF";
  }

  if (disabled) {
    baseColors = { backgroundColor: "#B4B4B4" };
    shadowColors = { backgroundColor: "#8E8E8E" };
    textColor = "#808080";
    borderColor = "#B4B4B4";
  }

  // Effect to animate the button when pressed state changes
  useEffect(() => {
    if (isPressed) {
      // Animate to pressed state
      Animated.parallel([
        Animated.timing(translateYAnimation, {
          toValue: 8,
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
        Animated.timing(translateYAnimation, {
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

  // Handle press events
  const handlePressIn = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      setIsPressed(false);
    }
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.shadow,
            shadowColors,
            {
              opacity: shadowOpacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.button,
            baseColors,
            { borderColor },
            {
              transform: [
                {
                  translateY: translateYAnimation,
                },
              ],
            },
          ]}
          {...props}
        >
          <View style={styles.contentContainer}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={textColor}
                style={styles.icon}
              />
            ) : icon ? (
              <View style={styles.icon}>{icon}</View>
            ) : null}
            <Text style={[styles.text, { color: textColor }]}>{children}</Text>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: verticalScale(45),
    marginBottom: verticalScale(5),
  },
  shadow: {
    position: "absolute",
    top: 5,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: moderateScale(13),
  },
  button: {
    padding: moderateScale(10),
    borderRadius: moderateScale(13),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    height: "88%",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
  },
});

export default Button;
