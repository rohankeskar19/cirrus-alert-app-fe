import React from "react";

import { StyleSheet, View } from "react-native";

import RadioOption from "@/components/RadioOption";
import { AVAILABLE_DAILY_GOALS } from "@/utils/constants";
import { verticalScale } from "@/utils/metrics";

type Step5Props = {
  selectedGoal: string;
  onOptionSelect: (goal: string) => void;
};

const Step5 = ({ selectedGoal, onOptionSelect }: Step5Props) => {
  return (
    <View style={styles.stepContainer}>
      {AVAILABLE_DAILY_GOALS.map((goal) => (
        <RadioOption
          label={goal.label}
          isSelected={goal.label == selectedGoal}
          variant="variant2"
          key={goal.label}
          onSelect={() => onOptionSelect(goal.label)}
          style={{ marginBottom: verticalScale(18), height: verticalScale(55) }}
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

export default Step5;
