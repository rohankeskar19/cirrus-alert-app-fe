import React, { useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useNavigation } from "expo-router";
import { get } from "lodash";
import { FormattedMessage, useIntl } from "react-intl";
import validator from "validator";

import AppleLogo from "@/assets/icons/apple-logo.svg";
import ChevronLeft from "@/assets/icons/chevron-left.svg";
import GoogleLogo from "@/assets/icons/google-logo.svg";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useThemeColor } from "@/hooks/useThemeColor";
import { loginUser } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigation = useNavigation();

  const backgroundColor = useThemeColor("background");
  const onBackground = useThemeColor("onBackground");

  const intl = useIntl();

  const handleGoogleSignIn = () => {};

  const handleAppleSignIn = () => {};

  const handleEmailSignIn = () => {};

  const validateLoginData = () => {
    setEmailError("");
    setPasswordError("");

    if (!validator.isEmail(email)) {
      setEmailError(intl.formatMessage({ id: "invalid_email_error" }));
      return false;
    }

    if (!validator.isStrongPassword(password)) {
      setPasswordError(intl.formatMessage({ id: "invalid_password_error" }));
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    try {
      if (validateLoginData()) {
        setLoading(true);

        await loginUser(email, password);

        navigation.reset({
          index: 0,
          routes: [{ name: "home" } as any],
        });

        setLoading(false);
      }
    } catch (err) {
      const error = get(
        err,
        "message",
        intl.formatMessage({ id: "login_error" })
      );

      Alert.alert(error);
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push("/onboarding");
  };

  const navigateToForgotPassword = () => {
    router.push("/forgot-password");
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
              <FormattedMessage id="login_heading" />
            </Text>

            <View style={styles.buttonsContainer}>
              <Button
                type="oauth"
                onPress={() => {}}
                style={{
                  width: "100%",
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
                  width: "100%",
                  height: verticalScale(45),
                }}
                disabled={false}
                loading={false}
                icon={<AppleLogo color={onBackground} />}
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
              <Input
                type="email"
                placeholder={intl.formatMessage({ id: "enter_email" })}
                onChangeText={(text) => setEmail(text)}
                value={email}
                style={{ marginBottom: verticalScale(21) }}
                showError={emailError.trim().length > 0}
                error={emailError}
              />
              <Input
                type="password"
                placeholder={intl.formatMessage({ id: "enter_password" })}
                onChangeText={(text) => setPassword(text)}
                value={password}
                style={{ marginBottom: verticalScale(21) }}
                showError={passwordError.trim().length > 0}
                error={passwordError}
              />
              <Button
                type="primary"
                onPress={handleLogin}
                style={{
                  width: "100%",
                  height: verticalScale(45),
                  marginBottom: verticalScale(27),
                }}
                disabled={false}
                loading={loading}
              >
                <Text>
                  <FormattedMessage id="login" />
                </Text>
              </Button>
              <View style={styles.forgotPasswordContainer}>
                <Text
                  style={styles.linkText}
                  onPress={navigateToForgotPassword}
                >
                  <FormattedMessage id="forgot_password" />
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText} onPress={navigateToSignup}>
              <FormattedMessage id="dont_have_account" />
              <Text style={styles.linkText}>
                <FormattedMessage id="signup" />
              </Text>
            </Text>
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
    width: "90%",
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
    fontFamily: "Outfit-Medium",
  },
  signupContainer: {
    marginTop: "auto",
    paddingBottom: verticalScale(30),
    alignItems: "center",
  },
  signupText: {
    fontSize: moderateScale(15),
    color: "#888888",
    padding: moderateScale(5),
    fontFamily: "Outfit-Medium",
  },
  backButton: {
    padding: moderateScale(5),
    marginLeft: horizontalScale(13),
    marginTop: verticalScale(30),
  },
  linkText: {
    color: "#888888",
    textDecorationLine: "underline",
    fontSize: moderateScale(16),
    fontFamily: "Outfit-Medium",
  },
  forgotPasswordContainer: {
    alignItems: "center",
  },
});

export default LoginScreen;
