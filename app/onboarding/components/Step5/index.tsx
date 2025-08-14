import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";

import LinksIcon from "@/assets/icons/links-icon.svg";
import SummaryIcon from "@/assets/icons/summary-icon.svg";

import RadioOption from "@/components/RadioOption";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

type Step5Props = {
  selectedVariant: string;
  setSelectedVariant: (value: string) => void;
};

const Step5 = ({ selectedVariant, setSelectedVariant }: Step5Props) => {
  const textColor = useThemeColor("textColor");
  const intl = useIntl();

  const radioOptions = [
    {
      value: "summary",
      label: intl.formatMessage({ id: "yes" }),
      icon: <SummaryIcon />,
    },
    {
      value: "daily",
      label: intl.formatMessage({ id: "no_just_links" }),
      icon: <LinksIcon />,
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: textColor }]}>
        <FormattedMessage id="step5_title" />
      </Text>

      <View style={styles.radioGroup}>
        {radioOptions.map((option) => (
          <RadioOption
            key={option.value}
            label={option.label}
            icon={option.icon}
            isSelected={selectedVariant == option.value}
            onSelect={() => setSelectedVariant(option.value)}
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
    fontFamily: "SpaceGrotesk-Medium",
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
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderWidth: 2,
    borderRadius: moderateScale(16),
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    marginRight: horizontalScale(16),
    width: moderateScale(32),
    height: moderateScale(32),
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: moderateScale(24),
  },
  radioText: {
    flex: 1,
    fontSize: moderateScale(18),
    fontFamily: "SpaceGrotesk-Regular",
  },
  checkContainer: {
    width: moderateScale(28),
    height: moderateScale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: "#B07CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "white",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
});

export default Step5;
