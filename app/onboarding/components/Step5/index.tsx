import React from "react";

import { StyleSheet, View } from "react-native";

import DailyLimitSlider from "@/components/DailyLimitSlider";
import { verticalScale } from "@/utils/metrics";

type Step5Props = {};

const Step5 = () => {
  return (
    <View style={styles.stepContainer}>
      <DailyLimitSlider />
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flexGrow: 1,
    width: "100%",
    height: "80%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: verticalScale(34),
  },
});

export default Step5;
