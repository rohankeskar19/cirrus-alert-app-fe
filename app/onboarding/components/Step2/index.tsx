import React from "react";

import { StyleSheet, View } from "react-native";

import { useIntl } from "react-intl";

import Input from "@/components/Input";
import { verticalScale } from "@/utils/metrics";

type Step2Props = {
  firstName: string;
  lastName: string;
  onNameChange: (name: string, key: "first_name" | "last_name") => void;
};

const Step2 = ({ firstName, lastName, onNameChange }: Step2Props) => {
  const intl = useIntl();

  return (
    <View style={styles.stepContainer}>
      <Input
        placeholder={intl.formatMessage({ id: "first_name_placeholder" })}
        onChangeText={(value) => onNameChange(value, "first_name")}
        value={firstName}
        style={{
          width: "100%",
          marginBottom: verticalScale(16),
          marginTop: verticalScale(50),
        }}
      />
      <Input
        placeholder={intl.formatMessage({ id: "last_name_placeholder" })}
        onChangeText={(value) => onNameChange(value, "last_name")}
        value={lastName}
        style={{
          width: "100%",
          marginBottom: verticalScale(130),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Step2;
