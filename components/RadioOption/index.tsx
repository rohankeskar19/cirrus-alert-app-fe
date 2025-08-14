import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

import Tick from "@/assets/icons/tick.svg";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

interface RadioOptionProps {
  label: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  style?: any;
}

const RadioOption: React.FC<RadioOptionProps> = ({
  label,
  icon,
  isSelected,
  onSelect,
  style = {},
}) => {
  const accentColor = useThemeColor("accentColor");
  const borderColor = isSelected
    ? useThemeColor("accentColor")
    : useThemeColor("inputBorder");
  const textColor = useThemeColor("textColor");

  return (
    <TouchableWithoutFeedback onPress={onSelect}>
      <View style={[styles.container, { borderColor }, style]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <Text style={[styles.text, { color: textColor }]}>{label}</Text>

        <View style={styles.checkContainer}>
          <View
            style={[
              styles.checkmark,
              {
                backgroundColor: isSelected ? accentColor : "transparent",
                borderColor: accentColor,
              },
            ]}
          >
            {isSelected && <Tick />}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderWidth: 2,
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  iconContainer: {
    marginRight: horizontalScale(18),
    width: moderateScale(32),
    height: moderateScale(32),
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    fontSize: moderateScale(18),
    fontFamily: "SpaceGrotesk-Medium",
  },
  checkContainer: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(100),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RadioOption;
