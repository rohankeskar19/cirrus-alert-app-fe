import React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale, verticalScale } from "@/utils/metrics";

const Step5 = () => {
  const textColor = useThemeColor("textColor");

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: textColor }]}>
        <FormattedMessage id="step5_title" />
      </Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        <FormattedMessage id="step5_subtitle" />{" "}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    width: "100%",
    fontSize: moderateScale(35),

    marginTop: verticalScale(20),
    fontFamily: "Inter-SemiBold",
  },
  subtitle: {
    width: "100%",
    fontSize: moderateScale(20),
    marginBottom: verticalScale(27),
    marginTop: verticalScale(5),
    fontFamily: "Inter-Medium",
  },
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Step5;
