import React, { useState } from "react";

import { StyleSheet, View } from "react-native";

import { useIntl } from "react-intl";

const Step8 = () => {
  const [currentDialogIndex, setCurrentDialogIndex] = useState(-1);

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

export default Step8;
