import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import ChevronLeft from "@/assets/icons/chevron-left.svg";
import Button from "@/components/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { updateUserProfile } from "@/slices/onboarding";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

import { SafeAreaView } from "react-native-safe-area-context";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";

const { width } = Dimensions.get("window");

const OnboardingScreen = () => {
  const intl = useIntl();

  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [alertText, setAlertText] = useState<string>("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedQuests, setSelectedQuests] = useState<string[]>([]);

  const [shownShockedAnimation, setShownShockAnimation] = useState(false);

  const backgroundColor = useThemeColor("background");
  const onBackground = useThemeColor("onBackground");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      updateUserProfile({
        first_name: email,
        last_name: password,
      })
    );
  }, [email, password]);

  const steps = [
    {
      content: (
        <Step1
          email={email}
          password={password}
          onValueChange={(value, key) => {
            if (key == "email") {
              setEmail(value);
            } else {
              setPassword(value);
            }
          }}
        />
      ),
    },
    {
      content: <Step2 />,
    },
    {
      content: <Step3 />,
    },
    {
      content: <Step4 />,
    },
    {
      content: <Step5 />,
    },
  ];

  useEffect(() => {
    const buttonTimeout = setTimeout(() => {
      setButtonDisabled(false);
    }, 300);

    return () => clearTimeout(buttonTimeout);
  }, []);

  const animateSlide = (direction: "left" | "right") => {
    slideAnim.setValue(direction === "right" ? width : -width);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep == 0) {
      } else {
        animateSlide("right");

        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateSlide("left");
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const getButtonDisabled = () => {
    if (buttonDisabled) return buttonDisabled;

    if (currentStep == 1) {
      if (email.trim() === "" || password.trim() === "") return true;
    }

    if (currentStep == 2) {
      if (alertText.trim().length < 5) return true;
    }

    if (currentStep == 4) {
    }

    if (currentStep == 5) {
    }

    if (currentStep == 6) {
      if (selectedQuests.length === 0) return true;
    }
  };

  const getButtonText = () => {
    if (currentStep == 0) {
      return intl.formatMessage({ id: "signup" });
    } else if (currentStep < 1) {
      return intl.formatMessage({ id: "continue" });
    } else if (currentStep === 7) {
      return intl.formatMessage({ id: "allow_notifications" });
    } else {
      return intl.formatMessage({ id: "next" });
    }
  };

  return (
    <View
      style={[{ backgroundColor: backgroundColor }, styles.screenContainer]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={1}
          >
            <ChevronLeft />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Animated.View
            style={[
              styles.animatedContent,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {steps[currentStep].content}
          </Animated.View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button
            type="primary"
            onPress={handleNext}
            style={{
              width: "90%",
              height: verticalScale(45),
              marginBottom: verticalScale(16),
            }}
            disabled={getButtonDisabled()}
            loading={false}
          >
            <Text>{getButtonText()}</Text>
          </Button>

          {currentStep === 7 && (
            <TouchableOpacity
              style={{
                marginTop: verticalScale(5),
                marginBottom: verticalScale(15),
              }}
              activeOpacity={1}
              onPress={() => router.push("/signup")}
            >
              <Text
                style={{
                  color: onBackground,
                  fontFamily: "Outfit-Medium",
                  fontSize: moderateScale(14),
                }}
              >
                <FormattedMessage id={"no_thanks"} />
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingTop: verticalScale(20),
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(10),
    paddingRight: horizontalScale(30),
    paddingTop: verticalScale(10),
  },
  backButton: {
    padding: moderateScale(5),
    marginRight: horizontalScale(10),
  },
  disabledBack: {
    color: "#ccc",
  },
  progressContainer: {
    width: "100%",
    flexGrow: 1,
    height: verticalScale(8),

    borderRadius: 100,
  },
  progressBar: {
    flexGrow: 1,
    height: "100%",
    backgroundColor: "#86DD70",
    borderRadius: 100,
  },
  contentContainer: {
    width: "90%",
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  animatedContent: {
    width: "100%",
    alignItems: "center",
  },
  illustrationContainer: {
    marginTop: verticalScale(25),
    paddingBottom: verticalScale(20),
  },
});

export default OnboardingScreen;
