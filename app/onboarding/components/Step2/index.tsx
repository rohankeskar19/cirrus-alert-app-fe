import React from "react";

import { StyleSheet, View } from "react-native";

import { useIntl } from "react-intl";

type Step2Props = {};

const Step2 = ({}: Step2Props) => {
  const intl = useIntl();

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

export default Step2;
