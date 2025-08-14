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

import { router, useNavigation } from "expo-router";
import { useIntl } from "react-intl";

import ChevronLeft from "@/assets/icons/chevron-left.svg";
import Button from "@/components/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

import OnboardingOverlay from "@/components/OnboardingOverlay";
import {
  AlertType,
  AlertVariant,
  createAlert,
  getCurrentUser,
  loginUser,
  signupUser,
  updateUserProfile,
} from "@/utils/apiUtils";
import { get } from "lodash";
import { SafeAreaView } from "react-native-safe-area-context";
import validator from "validator";
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

  const navigation = useNavigation();

  const [currentUser, setCurrentUser] = useState(null);

  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingAlert, setCreatingAlert] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertText, setAlertText] = useState<string>("");

  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [alertTextError, setAlertTextError] = useState<string>("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["news"]);
  const [selectedType, setSelectedType] = useState<AlertType>("immediate");
  const [selectedVariant, setSelectedVariant] =
    useState<AlertVariant>("summary");

  const backgroundColor = useThemeColor("background");

  useEffect(() => {
    handleStepNavigation();
  }, []);

  const handleStepNavigation = async () => {
    const currentUser = await getCurrentUser();

    setCurrentUser(currentUser as any);

    if (currentUser) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  };

  const steps = [
    {
      content: (
        <Step1
          email={email}
          password={password}
          emailError={emailError}
          passwordError={passwordError}
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
      content: (
        <Step2
          alertText={alertText}
          alertTextError={alertTextError}
          setAlertText={setAlertText}
        />
      ),
    },
    {
      content: (
        <Step3
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
        />
      ),
    },
    {
      content: (
        <Step4 selectedType={selectedType} setSelectedType={setSelectedType} />
      ),
    },
    {
      content: (
        <Step5
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
        />
      ),
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

  const handleNext = async () => {
    try {
      if (currentStep == 0) {
        if (
          !validator.isEmail(email) ||
          !validator.isStrongPassword(password)
        ) {
          if (!validator.isEmail(email)) {
            setEmailError(intl.formatMessage({ id: "invalid_email_error" }));
          }

          if (!validator.isStrongPassword(password)) {
            setPasswordError(
              intl.formatMessage({ id: "invalid_password_error" })
            );
          }
        } else {
          setCreatingUser(true);
          await signupUser(email, password);
          await loginUser(email, password);
          const currentUser = await getCurrentUser();
          setCurrentUser(currentUser as any);
          setCreatingUser(false);
          animateSlide("right");
          setCurrentStep(currentStep + 1);
        }
      } else if (currentStep == 1) {
        if (!validator.isLength(alertText, { min: 5, max: 150 })) {
          setAlertTextError(intl.formatMessage({ id: "invalid_alert_error" }));
        } else {
          animateSlide("right");
          setCurrentStep(currentStep + 1);
        }
      } else if (currentStep == 4) {
        console.log("Creating alert...");
        setCreatingAlert(true);
        await createAlert(
          alertText,
          selectedSources,
          selectedType,
          selectedVariant
        );

        await updateUserProfile(get(currentUser, "id", ""), {
          onboarding_done: true,
        });

        setTimeout(() => {
          setCreatingAlert(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "home" } as any],
          });
        }, 1200);
      } else {
        animateSlide("right");
        setCurrentStep(currentStep + 1);
      }
    } catch (err: any) {
      setCreatingUser(false);

      if (err.message.includes("duplicate key")) {
        setEmailError(intl.formatMessage({ id: "user_exists_error" }));
      } else {
        setEmailError(err.message);
      }
    }
  };

  const handleBack = async () => {
    if (currentStep > 0) {
      if (!currentUser) {
        animateSlide("left");
        setCurrentStep(currentStep - 1);
      } else {
        if (currentStep > 1) {
          animateSlide("left");
          setCurrentStep(currentStep - 1);
        }
      }
    } else {
      router.back();
    }
  };

  const getButtonDisabled = () => {
    if (buttonDisabled) return buttonDisabled;

    if (currentStep == 0) {
      if (email.trim() === "" || password.trim() === "") return true;
    }

    if (currentStep == 1) {
      if (alertText.trim() == "") return true;
    }
  };

  const getButtonText = () => {
    if (currentStep == 0) {
      return intl.formatMessage({ id: "signup" });
    } else if (currentStep < 1) {
      return intl.formatMessage({ id: "continue" });
    } else if (currentStep === 4) {
      return intl.formatMessage({ id: "finish" });
    } else {
      return intl.formatMessage({ id: "next" });
    }
  };

  const shouldShowBackButton = () => {
    if (currentUser) {
      if (currentStep > 1) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  return (
    <View
      style={[{ backgroundColor: backgroundColor }, styles.screenContainer]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {shouldShowBackButton() && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={1}
            >
              <ChevronLeft />
            </TouchableOpacity>
          )}
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
            loading={creatingUser}
          >
            <Text>{getButtonText()}</Text>
          </Button>
        </View>
        {creatingAlert && <OnboardingOverlay />}
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
