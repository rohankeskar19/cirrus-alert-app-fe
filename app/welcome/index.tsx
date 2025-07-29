import React, { useEffect, useState } from "react";

import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { FormattedMessage, useIntl } from "react-intl";

import Button from "@/components/Button";
import AnimatedCharacter from "@/components/Character";
import { CharacterStates } from "@/constants/CharacterStates";
import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale, verticalScale } from "@/utils/metrics";

const WelcomeScreen = () => {
  const intl = useIntl();
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);

  const backgroundColor = useThemeColor("background");

  const handleOpenSignup = () => {
    router.push("/onboarding");
  };

  const handleOpenLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    const dialogTimer = setTimeout(() => {
      if (currentDialogIndex < 1) setCurrentDialogIndex(currentDialogIndex + 1);
    }, 1000);

    return () => clearTimeout(dialogTimer);
  }, [currentDialogIndex]);

  return (
    <View style={[{ backgroundColor }, styles.screenContainer]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.illustrationContainer}>
            <AnimatedCharacter
              characterState={CharacterStates.IDLE}
              dialogText={
                [
                  intl.formatMessage({ id: "welcome_greeting" }),
                  intl.formatMessage({ id: "welcome_greeting_2" }),
                ][currentDialogIndex]
              }
              dialogPosition="bottom"
              animationDuration={400}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              type="primary"
              onPress={handleOpenSignup}
              style={{
                width: "90%",

                marginBottom: verticalScale(16),
              }}
              disabled={false}
              loading={false}
            >
              <Text>
                <FormattedMessage id="get_started" />
              </Text>
            </Button>
            <Button
              type="hollow"
              onPress={handleOpenLogin}
              style={{
                width: "90%",
                marginBottom: verticalScale(16),
              }}
              disabled={false}
              loading={false}
            >
              <Text>
                <FormattedMessage id="login" />
              </Text>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
  },
  illustrationContainer: {
    width: "100%",
    height: "auto",
    marginTop: "auto",
  },
});

export default WelcomeScreen;
