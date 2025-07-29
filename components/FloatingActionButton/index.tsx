import React from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import FabPlus from "@/assets/icons/fab-plus.svg";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

const FloatingActionButton: React.FC<{ onPress: () => void }> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.fabContainer}
    >
      <View style={styles.fabWrapper}>
        <View style={styles.fab}>
          <FabPlus />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: verticalScale(100),
    right: horizontalScale(29),
    zIndex: 10,
  },
  fabWrapper: {
    position: "relative",
    width: moderateScale(57),
    height: moderateScale(57),
  },
  fab: {
    width: moderateScale(57),
    height: moderateScale(57),
    borderRadius: 100,
    backgroundColor: "#B07CFF",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FloatingActionButton;
