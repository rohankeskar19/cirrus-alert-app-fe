import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";

import DailyDigestIcon from "@/assets/icons/daily-digest.svg";
import ThunderIcon from "@/assets/icons/thunder-icon.svg";
import WeeklyIcon from "@/assets/icons/weekly.svg";

import RadioOption from "@/components/RadioOption";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AlertType } from "@/utils/apiUtils";
import { moderateScale, verticalScale } from "@/utils/metrics";

type Step4Props = {
  selectedType: string;
  setSelectedType: (value: AlertType) => void;
};

const Step4 = ({ selectedType, setSelectedType }: Step4Props) => {
  const textColor = useThemeColor("textColor");
  const intl = useIntl();

  const radioOptions = [
    {
      value: "immediate",
      label: intl.formatMessage({ id: "immediately" }),
      icon: <ThunderIcon />,
    },
    {
      value: "daily",
      label: intl.formatMessage({ id: "daily" }),
      icon: <DailyDigestIcon />,
    },
    {
      value: "weekly",
      label: intl.formatMessage({ id: "weekly" }),
      icon: <WeeklyIcon />,
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: textColor }]}>
        <FormattedMessage id="step4_title" />
      </Text>

      <View style={styles.radioGroup}>
        {radioOptions.map((option) => (
          <RadioOption
            key={option.value}
            label={option.label}
            icon={option.icon}
            isSelected={selectedType == option.value}
            onSelect={() => setSelectedType(option.value as AlertType)}
          />
        ))}
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
    fontFamily: "Inter-SemiBold",
  },
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  radioGroup: {
    width: "100%",
    gap: verticalScale(21),
  },
});

export default Step4;
