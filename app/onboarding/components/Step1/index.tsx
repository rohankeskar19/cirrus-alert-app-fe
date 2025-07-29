import React from "react";

import { StyleSheet, View } from "react-native";

const Step1 = () => {
  return <View style={styles.stepContainer}></View>;
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Step1;
