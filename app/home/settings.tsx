import React from "react";

import { Alert, Image, StyleSheet, Text } from "react-native";

import { router } from "expo-router";
import { get } from "lodash";

import Button from "@/components/Button";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { signOutUser } from "@/utils/apiUtils";

export default function SettingsTab() {
  const handleLogout = async () => {
    try {
      await signOutUser();
      router.replace("/welcome");
    } catch (err) {
      Alert.alert(get(err, "message", ""));
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <Button
        type="hollow"
        onPress={handleLogout}
        disabled={false}
        loading={false}
        style={{ width: "100%" }}
      >
        <Text>Log out</Text>
      </Button>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
