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
import AnimatedCharacter from "@/components/Character";
import { CharacterStates } from "@/constants/CharacterStates";
import { useAccessibilityPermission } from "@/hooks/useAccessibilityPermission";
import { useOverlayPermission } from "@/hooks/useOverlayPermission";
import { useScreenTimePermission } from "@/hooks/useScreenTimePermission";
import { useThemeColor } from "@/hooks/useThemeColor";
import { updateUserProfile } from "@/slices/onboarding";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

import { SafeAreaView } from "react-native-safe-area-context";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import Step6 from "./components/Step6";
import Step7 from "./components/Step7";
import Step8 from "./components/Step8";

const { width } = Dimensions.get("window");

const OnboardingScreen = () => {
  const intl = useIntl();

  const [characterState, setCharacterState] = useState<
    (typeof CharacterStates)[keyof typeof CharacterStates]
  >(CharacterStates.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedQuests, setSelectedQuests] = useState<string[]>([]);

  const backgroundColor = useThemeColor("background");
  const onBackground = useThemeColor("onBackground");
  const progressBg = useThemeColor("questStat");

  const { permissionStatus: usageStatsPermissionStatus } =
    useScreenTimePermission();
  const { permissionStatus: overlayPermissionStatus } = useOverlayPermission();
  const { permissionStatus: accessibilityPermissionStatus } =
    useAccessibilityPermission();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      updateUserProfile({
        first_name: firstName,
        last_name: lastName,
      })
    );
  }, [firstName, lastName]);

  useEffect(() => {
    if (currentStep === 0) {
      setCharacterState(CharacterStates.NOTEPAD_TALKING);
    }
  }, [currentStep]);

  const steps = [
    {
      content: <Step1 />,
    },
    {
      content: (
        <Step2
          firstName={firstName}
          lastName={lastName}
          onNameChange={(name, key) => {
            if (key == "first_name") {
              setFirstName(name);
            } else {
              setLastName(name);
            }
          }}
        />
      ),
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
    {
      content: <Step6 />,
    },
    {
      content: (
        <Step7
          selectedQuests={selectedQuests}
          setSelectedQuests={setSelectedQuests}
        />
      ),
    },
    {
      content: <Step8 />,
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

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      animateSlide("right");

      setCurrentStep(currentStep + 1);

      if (currentStep > 0) {
        setCharacterState(CharacterStates.NOTEPAD_WRITING);
      }

      setTimeout(
        () => {
          setCharacterState(CharacterStates.NOTEPAD_WRITING_IDLE);
        },
        currentStep == 0 ? 0 : 500
      );
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

  useEffect(() => {
    animateProgress();
  }, [currentStep]);

  const getButtonDisabled = () => {
    if (buttonDisabled) return buttonDisabled;

    if (currentStep == 1) {
      if (firstName.trim() === "" || lastName.trim() === "") return true;
    }

    if (currentStep == 2) {
      if (
        !usageStatsPermissionStatus ||
        usageStatsPermissionStatus.status !== "approved" ||
        !overlayPermissionStatus ||
        overlayPermissionStatus.status !== "approved"
        // ||
        // !accessibilityPermissionStatus ||
        // accessibilityPermissionStatus.status !== "approved"
      )
        return true;
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
    if (currentStep < 1) {
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
          <View
            style={[{ backgroundColor: progressBg }, styles.progressContainer]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "90%"],
                  }),
                },
              ]}
            />
          </View>
        </View>
        (
        <View style={styles.illustrationContainer}>
          <AnimatedCharacter
            characterState={characterState}
            dialogText={
              [
                intl.formatMessage({ id: "step1_dialog" }),
                intl.formatMessage({ id: "step2_dialog" }),
                intl.formatMessage({ id: "step3_dialog" }, { name: firstName }),
                intl.formatMessage({ id: "step4_dialog" }),
                intl.formatMessage({ id: "step5_dialog" }),
                intl.formatMessage({ id: "step6_dialog" }),
                intl.formatMessage({ id: "step7_dialog" }),
                intl.formatMessage({ id: "step8_dialog" }),
              ][currentStep]
            }
            dialogPosition="right"
            animationDuration={400}
          />
        </View>
        )
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
