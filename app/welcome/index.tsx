import GlobeIcon from "@/assets/icons/globe.svg";
import GoogleLogo from "@/assets/icons/google-logo.svg";
import Button from "@/components/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale, verticalScale } from "@/utils/metrics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomeScreen = () => {
  const intl = useIntl();
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);

  const backgroundColor = useThemeColor("background");
  const textColor = useThemeColor("textColor");

  const handleOpenSignup = () => {
    router.push("/onboarding");
  };

  const handleOpenLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    const dialogTimer = setTimeout(() => {
      if (currentDialogIndex < 1) setCurrentDialogIndex(currentDialogIndex + 1);
    }, 1500);
    return () => clearTimeout(dialogTimer);
  }, [currentDialogIndex]);

  return (
    <View style={[{ backgroundColor }, styles.screenContainer]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: verticalScale(160),
          }}
        >
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: textColor }]}>
              <FormattedMessage id="welcome_title" />
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              <FormattedMessage id="welcome_subtitle" />
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <LinearGradient
        colors={["transparent", backgroundColor]}
        locations={[0, 0.8]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      <View style={styles.floatingButtons}>
        <Button
          type="primary"
          onPress={handleOpenSignup}
          style={{
            width: "90%",
            marginBottom: verticalScale(16),
          }}
          disabled={false}
          loading={false}
        >
          <Text>
            <FormattedMessage id="get_started" />
          </Text>
        </Button>
        <Button
          type="oauth"
          onPress={() => {}}
          style={{
            width: "90%",
            height: verticalScale(45),
            marginBottom: verticalScale(16),
          }}
          disabled={false}
          loading={false}
          icon={<GoogleLogo />}
        >
          <Text>
            <FormattedMessage id="continue_with_google" />
          </Text>
        </Button>
        <View style={styles.loginContainer}>
          <Text
            style={[styles.loginText, { color: textColor }]}
            onPress={handleOpenLogin}
          >
            <FormattedMessage id="already_have_account" />
            <Text style={styles.linkText}>
              <FormattedMessage id="login" />
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.globeContainer}>
        <GlobeIcon style={styles.globe} color={textColor} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: verticalScale(60),
    zIndex: 1,
  },
  title: {
    fontSize: moderateScale(35),
    marginBottom: verticalScale(18),
    fontFamily: "SpaceGrotesk-Medium",
  },
  subtitle: {
    fontSize: moderateScale(18),
    fontFamily: "SpaceGrotesk-Medium",
  },
  globeContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  globe: {
    width: 300,
    height: 300,
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    zIndex: 1,
  },
  floatingButtons: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: verticalScale(40),
    alignItems: "center",
    zIndex: 2,
  },
  loginContainer: {
    marginTop: "auto",
    paddingBottom: verticalScale(30),
    alignItems: "center",
  },
  loginText: {
    fontSize: moderateScale(15),
    padding: moderateScale(5),
    fontFamily: "SpaceGrotesk-Medium",
  },
  linkText: {
    textDecorationLine: "underline",
    fontSize: moderateScale(14),
  },
});

export default WelcomeScreen;
