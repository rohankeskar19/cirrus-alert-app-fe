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
import { forgotPassword } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { SafeAreaView } from "react-native-safe-area-context";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor("background");
  const onBackground = useThemeColor("onBackground");

  const intl = useIntl();

  const handleForgotPassword = async () => {
    try {
      if (validateForgotPasswordData()) {
        setLoading(true);

        await forgotPassword(email);

        router.back();

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

  const validateForgotPasswordData = () => {
    setEmailError("");

    if (!validator.isEmail(email)) {
      setEmailError(intl.formatMessage({ id: "invalid_email_error" }));
      return false;
    }

    return true;
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
              <FormattedMessage id="fogot_password_title" />
            </Text>

            <View style={styles.buttonsContainer}>
              <Input
                type="email"
                placeholder={intl.formatMessage({ id: "enter_email" })}
                onChangeText={(text) => setEmail(text)}
                value={email}
                style={{ marginBottom: verticalScale(21) }}
                showError={emailError.trim().length > 0}
                error={emailError}
              />

              <Button
                type="primary"
                onPress={handleForgotPassword}
                style={{
                  width: "100%",
                  height: verticalScale(45),
                  marginBottom: verticalScale(27),
                }}
                disabled={false}
                loading={loading}
              >
                <Text>
                  <FormattedMessage id="send_verification_link" />
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
  },
  backButton: {
    padding: moderateScale(5),
    marginLeft: horizontalScale(13),
    marginTop: verticalScale(30),
  },
  linkText: {
    color: "#888888",
    textDecorationLine: "underline",
  },
  forgotPasswordContainer: {
    alignItems: "center",
  },
});

export default ForgotPasswordScreen;
