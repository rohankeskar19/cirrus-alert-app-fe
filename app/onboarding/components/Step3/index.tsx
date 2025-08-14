import React from "react";

import { StyleSheet, View } from "react-native";

import { moderateScale, verticalScale } from "@/utils/metrics";

const Step3 = () => {
  return <View style={styles.stepContainer}></View>;
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: verticalScale(20),
    paddingBottom: verticalScale(40),
  },
  permissionCard: {
    borderRadius: moderateScale(16),
    padding: moderateScale(15),
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 2,
  },
  shieldIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#00c896",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "white",
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(20),
    fontFamily: "Outfit-SemiBold",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(18),
    fontFamily: "Outfit-Medium",
  },
  grantButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 16,
  },
});

export default Step3;
