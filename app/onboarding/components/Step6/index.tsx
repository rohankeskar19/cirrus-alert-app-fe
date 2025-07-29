import React from "react";

import { StyleSheet, View } from "react-native";

import RadioOption from "@/components/RadioOption";
import { AVAILABLE_TIMES } from "@/utils/constants";
import { verticalScale } from "@/utils/metrics";

type Step6Props = {
  selectedTime: string;
  onOptionSelect: (goal: string) => void;
};

const Step6 = ({ selectedTime, onOptionSelect }: Step6Props) => {
  return (
    <View style={styles.stepContainer}>
      {AVAILABLE_TIMES.map((availableTime) => (
        <RadioOption
          label={availableTime.label}
          isSelected={availableTime.label == selectedTime}
          variant="variant1"
          icon={availableTime.icon}
          key={availableTime.label}
          onSelect={() => onOptionSelect(availableTime.label)}
          style={{ marginBottom: verticalScale(18), height: verticalScale(72) }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: verticalScale(34),
  },
});

export default Step6;
