import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { FormattedMessage, useIntl } from "react-intl";

import Input from "@/components/Input";
import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale, verticalScale } from "@/utils/metrics";

type Step1Props = {
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  onValueChange: (value: string, key: "email" | "password") => void;
};

const Step1 = ({
  email,
  password,
  emailError,
  passwordError,
  onValueChange,
}: Step1Props) => {
  const intl = useIntl();

  const textColor = useThemeColor("textColor");

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: textColor }]}>
        <FormattedMessage id="step1_title" />
      </Text>
      <Input
        placeholder={intl.formatMessage({ id: "email_placeholder" })}
        onChangeText={(value) => onValueChange(value, "email")}
        value={email}
        style={{
          width: "100%",
          marginBottom: verticalScale(16),
        }}
        error={emailError}
        showError={emailError != ""}
      />
      <Input
        type="password"
        placeholder={intl.formatMessage({ id: "password_placeholder" })}
        onChangeText={(value) => onValueChange(value, "password")}
        value={password}
        style={{
          width: "100%",
          marginBottom: verticalScale(130),
        }}
        error={passwordError}
        showError={passwordError != ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    width: "100%",
    fontSize: moderateScale(35),
    marginBottom: verticalScale(27),
    marginTop: verticalScale(20),
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

export default Step1;
