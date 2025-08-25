import React, { useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { get } from "lodash";
import { FormattedMessage, useIntl } from "react-intl";
import validator from "validator";

import ChevronLeft from "@/assets/icons/chevron-left.svg";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useThemeColor } from "@/hooks/useThemeColor";
import { signupUser } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { SafeAreaView } from "react-native-safe-area-context";

const SignupFormScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const backgroundColor = useThemeColor("background");

  const secondaryGray = useThemeColor("secondaryGray");

  const intl = useIntl();

  const validateSignupData = () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!validator.isEmail(email)) {
      setEmailError(intl.formatMessage({ id: "invalid_email_error" }));
      return false;
    }

    if (!validator.isStrongPassword(password)) {
      setPasswordError(intl.formatMessage({ id: "invalid_password_error" }));
      return false;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setConfirmPasswordError(
        intl.formatMessage({ id: "password_not_matching_error" })
      );
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    try {
      if (validateSignupData()) {
        setLoading(true);
        // Sign up logic here
        await signupUser(email, password);

        router.push("/login");

        setLoading(false);
      }
    } catch (err) {
      Alert.alert(
        get(err, "message", intl.formatMessage({ id: "user_creation_error" }))
      );
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push("/login");
  };

  return (
    <View style={[{ backgroundColor }, styles.screenContainer]}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={1}
          >
            <ChevronLeft color={secondaryGray} />
          </TouchableOpacity>
          <View style={styles.formContainer}>
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
            <Input
              type="password"
              placeholder={intl.formatMessage({ id: "confirm_password" })}
              onChangeText={(text) => setConfirmPassword(text)}
              value={confirmPassword}
              style={{ marginBottom: verticalScale(41) }}
              showError={confirmPasswordError.trim().length > 0}
              error={confirmPasswordError}
            />
            <Button
              type="primary"
              onPress={handleSignUp}
              style={{
                width: "100%",
                height: verticalScale(45),
                marginBottom: verticalScale(16),
              }}
              disabled={false}
              loading={loading}
            >
              <Text>
                <FormattedMessage id="sign_up" />
              </Text>
            </Button>
            <Text style={styles.termsText}>
              <FormattedMessage id="by_clicking" />
              <Text style={styles.linkText}>
                <FormattedMessage id="terms" />
              </Text>
              <FormattedMessage id="and" />
              <Text style={styles.linkText}>
                <FormattedMessage id="privacy_policy" />
              </Text>
            </Text>
          </View>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText} onPress={navigateToLogin}>
              <FormattedMessage id="already_have_account" />
              <Text style={styles.linkText}>
                <FormattedMessage id="login" />
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    width: "90%",
    alignItems: "center",
    marginTop: "auto",
    marginHorizontal: "auto",
  },
  termsText: {
    textAlign: "center",
    color: "#888888",
    fontSize: moderateScale(14),
    marginTop: verticalScale(10),
    fontFamily: "Outfit-Medium",
  },
  linkText: {
    color: "#888888",
    textDecorationLine: "underline",
    fontSize: moderateScale(14),
  },
  loginContainer: {
    marginTop: "auto",
    paddingBottom: verticalScale(30),
    alignItems: "center",
  },
  loginText: {
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
});

export default SignupFormScreen;
