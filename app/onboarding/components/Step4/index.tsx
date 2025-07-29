import React from "react";

import { StyleSheet, View } from "react-native";

import RadioOption from "@/components/RadioOption";
import { AVAILABLE_INTERESTS } from "@/utils/constants";
import { verticalScale } from "@/utils/metrics";

type Step4Props = {
  selectedInterests: string[];
  onOptionSelect: (option: string, selected: boolean) => void;
};

const Step4 = ({ selectedInterests, onOptionSelect }: Step4Props) => {
  return (
    <View style={styles.stepContainer}>
      {AVAILABLE_INTERESTS.map((interest) => (
        <RadioOption
          label={interest}
          isSelected={selectedInterests.includes(interest)}
          variant="variant1"
          onSelect={() =>
            onOptionSelect(interest, !selectedInterests.includes(interest))
          }
          key={interest}
          style={{ marginBottom: verticalScale(18), height: verticalScale(58) }}
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

export default Step4;
