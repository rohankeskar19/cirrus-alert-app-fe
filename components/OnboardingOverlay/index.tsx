import LottieView from "lottie-react-native";
import React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

type OnboardingOverlayProps = {
  animationSize?: number;
};

const OnboardingOverlay = ({ animationSize = 200 }: OnboardingOverlayProps) => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");

  return (
    <View style={[styles.overlay, { backgroundColor: backgroundColor }]}>
      <View style={[styles.container, { backgroundColor }]}>
        <View
          style={[
            styles.animationContainer,
            { width: animationSize, height: animationSize },
          ]}
        >
          <LottieView
            source={require("@/assets/animations/globe-internet.json")}
            style={styles.animation}
            autoPlay
            loop
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: textColor }]}>
          <FormattedMessage id={"creating_alert_title"} />
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    width: "90%",
    maxWidth: horizontalScale(320),
    borderRadius: moderateScale(20),
    padding: horizontalScale(24),
    alignItems: "center",
  },
  animationContainer: {
    marginBottom: verticalScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(30),
  },
  subtitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(22),
    opacity: 0.8,
  },
  buttonContainer: {
    width: "100%",
    gap: verticalScale(12),
  },
  continueButton: {
    width: "100%",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: "white",
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },
  skipButton: {
    width: "100%",
    paddingVertical: verticalScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Regular",
    opacity: 0.7,
  },
});

export default OnboardingOverlay;
