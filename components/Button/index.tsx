import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  let baseColors, textColor, borderColor;

  const backgroundColor = useThemeColor("background");
  const onBackgroundColor = useThemeColor("onBackground");
  const textColorTheme = useThemeColor("textColor");
  const borderHollowColor = useThemeColor("borderHollow");

  switch (type) {
    case "primary":
      baseColors = { backgroundColor: onBackgroundColor };
      textColor = "#ffffff";
      borderColor = onBackgroundColor;
      break;
    case "hollow":
      baseColors = { backgroundColor: backgroundColor };
      textColor = textColorTheme;
      borderColor = borderHollowColor;
      break;
    case "oauth":
      baseColors = { backgroundColor: backgroundColor };
      textColor = textColorTheme;
      borderColor = borderHollowColor;
      break;
    case "correct":
      baseColors = { backgroundColor: "#8CE967" };
      textColor = "#FFFFFF";
      borderColor = "#8CE967";
      break;
    case "wrong":
      baseColors = { backgroundColor: "#E98567" };
      textColor = "#FFFFFF";
      borderColor = "#E98567";
      break;
    case "help":
      baseColors = { backgroundColor: "#F0FFC0" };
      textColor = "#000000";
      borderColor = "#F0FFC0";
      break;
    default:
      baseColors = { backgroundColor: "#B07CFF" };
      textColor = "#FFFFFF";
      borderColor = "#B07CFF";
  }

  if (disabled) {
    baseColors = { backgroundColor: "#B4B4B4" };
    textColor = "#808080";
    borderColor = "#B4B4B4";
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        baseColors,
        { borderColor },
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={1}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: moderateScale(10),
    borderRadius: moderateScale(100),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(45),
    width: "100%",
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
    fontFamily: "Inter-SemiBold",
  },
});

export default Button;
