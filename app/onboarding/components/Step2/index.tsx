import React from "react";

import { StyleSheet, Text, TextInput, View } from "react-native";

import { FormattedMessage, useIntl } from "react-intl";

import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

type Step2Props = {
  alertText: string;
  alertTextError: string;
  setAlertText: (value: string) => void;
};

const Step2 = ({ alertText, alertTextError, setAlertText }: Step2Props) => {
  const intl = useIntl();

  const textColor = useThemeColor("textColor");
  const inputBg = useThemeColor("inputBg");
  const inputBorder = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");
  const accentColor = useThemeColor("accentColor");

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: textColor }]}>
        <FormattedMessage id="step2_title" />
      </Text>

      <View
        style={[
          { borderRadius: moderateScale(20), width: "100%" },
          styles.textAreaWrapper,
        ]}
      >
        <View
          style={[
            { backgroundColor: inputBg, borderRadius: moderateScale(20) },
            styles.textAreaContainer,
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              { borderColor: inputBorder },
              alertTextError ? styles.inputError : null,
            ]}
          >
            <TextInput
              style={[{ color: textColor }, styles.textArea]}
              placeholder={intl.formatMessage({
                id: "alert_text_placeholder",
              })}
              placeholderTextColor={placeholderGray}
              value={alertText}
              onChangeText={setAlertText}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              autoCorrect={true}
              selectionColor={accentColor}
            />
          </View>
        </View>
        {alertTextError ? (
          <Text style={styles.errorText}>{alertTextError}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    width: "100%",
    fontSize: moderateScale(35),
    marginBottom: verticalScale(27),
    marginTop: verticalScale(20),
    fontFamily: "SpaceGrotesk-Medium",
  },
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  textAreaWrapper: {
    width: "100%",
  },
  textAreaContainer: {
    width: "100%",
    marginBottom: verticalScale(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    minHeight: verticalScale(120),
  },
  inputError: {
    borderColor: "#FF6E6E",
  },
  textArea: {
    flex: 1,
    fontSize: moderateScale(18),
    fontFamily: "SpaceGrotesk-Regular",
    lineHeight: moderateScale(22),
    minHeight: verticalScale(88),
  },
  errorText: {
    color: "#FF6E6E",
    fontSize: moderateScale(14),
    marginTop: verticalScale(4),
    marginLeft: horizontalScale(16),
    fontFamily: "SpaceGrotesk-Regular",
  },
});

export default Step2;
