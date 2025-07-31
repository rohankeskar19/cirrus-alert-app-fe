import React from "react";

import { StyleSheet, View } from "react-native";

import AppBlockingCard from "@/components/AppBlockingCard";
import { useScreenTime } from "@/hooks/useScreenTime";
import { verticalScale } from "@/utils/metrics";

type Step6Props = {};

const Step6 = () => {
  const { detailedAppUsage } = useScreenTime();

  return (
    <View style={styles.stepContainer}>
      {detailedAppUsage?.apps.map((app) => (
        <AppBlockingCard
          key={app.packageName}
          app={app}
          onProceed={(appsWithCosts) => console.log(appsWithCosts)}
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
