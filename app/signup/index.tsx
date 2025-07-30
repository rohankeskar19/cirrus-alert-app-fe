import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { FormattedMessage } from "react-intl";

import AppleLogo from "@/assets/icons/apple-logo.svg";
import ChevronLeft from "@/assets/icons/chevron-left.svg";
import GoogleLogo from "@/assets/icons/google-logo.svg";
import Button from "@/components/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { SafeAreaView } from "react-native-safe-area-context";

const SignupScreen = () => {
  const backgroundColor = useThemeColor("background");
  const onBackground = useThemeColor("onBackground");

  const handleGoogleSignIn = () => {};

  const handleAppleSignIn = () => {};

  const handleEmailSignIn = () => {};

  const handleOpenSignup = () => {
    router.push("/signup/form");
  };

  return (
    <View style={[{ backgroundColor }, styles.screenContainer]}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={1}
          >
            <ChevronLeft />
          </TouchableOpacity>
          <View style={styles.contentContainer}>
            <Text style={[{ color: onBackground }, styles.headerText]}>
              <FormattedMessage id="signup_heading" />
            </Text>

            <View style={styles.buttonsContainer}>
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

              <Button
                type="oauth"
                onPress={() => {}}
                style={{
                  width: "90%",
                  height: verticalScale(45),
                }}
                disabled={false}
                loading={false}
                icon={<AppleLogo />}
              >
                <Text>
                  <FormattedMessage id="continue_with_apple" />
                </Text>
              </Button>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  <FormattedMessage id="or" />
                </Text>
                <View style={styles.dividerLine} />
              </View>
              <Button
                type="primary"
                onPress={handleOpenSignup}
                style={{
                  width: "90%",
                  height: verticalScale(45),
                  marginBottom: verticalScale(16),
                }}
                disabled={false}
                loading={false}
              >
                <Text>
                  <FormattedMessage id="continue_with_email" />
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: moderateScale(20),
    textAlign: "center",
    marginBottom: verticalScale(32),
    marginTop: "auto",
    fontFamily: "Outfit-SemiBold",
  },
  buttonsContainer: {
    width: "100%",
    marginBottom: "auto",
    marginHorizontal: "auto",
    alignItems: "center",
  },
  dividerContainer: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(30),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    paddingHorizontal: horizontalScale(10),
    color: "#E5E5E5",
    fontSize: moderateScale(13),
  },
  backButton: {
    padding: moderateScale(5),
    marginLeft: horizontalScale(13),
    marginTop: verticalScale(30),
  },
});

export default SignupScreen;
