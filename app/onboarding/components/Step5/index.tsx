import React from "react";

import { StyleSheet, View } from "react-native";

import { verticalScale } from "@/utils/metrics";

type Step5Props = {};

const Step5 = () => {
  return <View style={styles.stepContainer}></View>;
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: verticalScale(34),
  },
});

export default Step5;
