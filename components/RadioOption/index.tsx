import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import Tick from "@/assets/icons/tick.svg";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

interface RadioOptionProps {
  label: any;
  variant: "variant1" | "variant2" | "variant3";
  variant2Text?: string;
  description?: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  style?: any;
}

const RadioOption: React.FC<RadioOptionProps> = ({
  label,
  variant,
  icon,
  description,
  variant2Text,
  isSelected,
  onSelect,
  style = {},
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const translateYAnimation = useRef(new Animated.Value(0)).current;

  const shadowOpacity = useRef(new Animated.Value(1)).current;

  const baseColors = { backgroundColor: "#FFFFFF" };

  const shadowColors = isSelected
    ? { backgroundColor: "#B07CFF" }
    : { backgroundColor: "#D9D9D9" };

  const textColor = "#000000";
  const borderColor = isSelected ? "#B07CFF" : "#D9D9D9";

  useEffect(() => {
    if (isPressed) {
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

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    onSelect();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
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
            styles.radioButton,
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
        >
          <View style={[styles.contentContainer]}>
            {icon && (
              <View style={styles.icon}>
                <Text style={styles.iconText}>{icon}</Text>
              </View>
            )}
            <View
              style={{
                display: "flex",
                flexDirection: variant == "variant3" ? "column" : "row",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                maxWidth: variant == "variant1" ? "83%" : "100%",
              }}
            >
              <Text
                style={[
                  styles.text,
                  { color: textColor },
                  variant == "variant3" ? { maxHeight: verticalScale(15) } : {},
                ]}
              >
                {label}
              </Text>

              {variant == "variant3" && description && (
                <Text
                  style={{
                    marginTop: verticalScale(8),
                    maxWidth: "95%",
                    fontFamily: "Inter-Regular",
                    fontStyle: "italic",
                    color: "#646464",
                  }}
                >
                  {description}
                </Text>
              )}
            </View>
            {variant == "variant1" ? (
              isSelected ? (
                <View style={styles.checkmarkContainer}>
                  <View
                    style={[
                      styles.checkmark,
                      {
                        width: moderateScale(28),
                        height: moderateScale(28),

                        borderRadius: moderateScale(100),
                        backgroundColor: "#B07CFF",
                      },
                    ]}
                  >
                    <Tick />
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.checkmarkContainer,
                    {
                      width: moderateScale(28),
                      height: moderateScale(28),
                    },
                  ]}
                ></View>
              )
            ) : (
              <View style={styles.checkmarkContainer}>
                <View style={[styles.checkmark]}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? "#B07CFF" : "#000000" },
                    ]}
                  >
                    {variant2Text}
                  </Text>
                </View>
              </View>
            )}
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
    height: verticalScale(41),
    marginBottom: verticalScale(4),
  },
  shadow: {
    position: "absolute",
    height: "90%",
    bottom: verticalScale(0),
    left: 0,
    right: 0,
    borderRadius: moderateScale(20),
    zIndex: 1,
  },
  radioButton: {
    width: "100%",
    height: "90%",
    position: "absolute",
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(20),
    borderWidth: 2,
    alignItems: "center",
    top: 0,
    left: 0,
    zIndex: 2,
  },
  contentContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: horizontalScale(12),
    width: moderateScale(24),
    height: "100%",
    fontSize: moderateScale(50),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "auto",
  },
  iconText: {
    fontSize: moderateScale(20),
  },
  text: {
    maxWidth: "96%",
    fontSize: moderateScale(15),
    flex: 1,
    flexWrap: "wrap",
  },
  checkmarkContainer: {
    height: "100%",
    marginLeft: "auto",
  },
  checkmark: {
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
  },
  optionText: {
    fontSize: moderateScale(15),
  },
});

export default RadioOption;
