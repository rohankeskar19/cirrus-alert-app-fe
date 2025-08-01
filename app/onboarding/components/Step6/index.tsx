import React from "react";

import { StyleSheet, View } from "react-native";

import AppBlockingCard from "@/components/AppBlockingCard";
import { useScreenTime } from "@/hooks/useScreenTime";

type Step6Props = {};

const Step6 = () => {
  const { detailedAppUsage } = useScreenTime();

  return (
    <View style={styles.stepContainer}>
      {detailedAppUsage?.apps.map((app) => (
        <AppBlockingCard key={app.packageName} app={app} />
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
  },
});

export default Step6;
