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

import * as Notifications from "expo-notifications";
import { router, useNavigation } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";

import ChevronLeft from "@/assets/icons/chevron-left.svg";
import Button from "@/components/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

import OnboardingOverlay from "@/components/OnboardingOverlay";
import {
  AlertType,
  createAlert,
  getCurrentUser,
  loginUser,
  signupUser,
  supabase,
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
  const [notificationPermissionGranted, setNotificationPermissionGranted] =
    useState(false);

  const backgroundColor = useThemeColor("background");
  const secondaryGray = useThemeColor("secondaryGray");
  const textColor = useThemeColor("textColor");

  useEffect(() => {
    handleStepNavigation();
  }, []);

  const handleStepNavigation = async () => {
    const currentUser = await getCurrentUser();

    setCurrentUser(currentUser as any);

    if (currentUser?.profile) {
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
        if (!notificationPermissionGranted) {
          if (currentUser) {
            const token = await requestNotificationPermission(
              get(currentUser, "id", "")
            );

            console.log("Token ", token);
            if (token) {
              setNotificationPermissionGranted(true);
            }
          }
        } else {
          handleOnboardingCompletion();
        }
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
    } else if (currentStep === 3) {
      return intl.formatMessage({ id: "next" });
    } else if (currentStep === 4) {
      if (!notificationPermissionGranted) {
        return intl.formatMessage({ id: "allow_permission" });
      } else {
        return intl.formatMessage({ id: "finish" });
      }
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

  const handleOnboardingCompletion = async () => {
    setCreatingAlert(true);
    await createAlert(alertText, selectedSources, selectedType);

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
  };

  const requestNotificationPermission = async (userId: string) => {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("Notification permission not granted");
        return null;
      }

      const tokenPromise = Notifications.getDevicePushTokenAsync();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Token request timeout")), 30000)
      );

      const tokenData = (await Promise.race([
        tokenPromise,
        timeoutPromise,
      ])) as any;
      console.log("Obtained Expo Push Token:", tokenData);

      const token = tokenData?.data;
      if (!token) {
        console.error("No token received from Expo");
        return null;
      }

      console.log("Expo Push Token:", token);

      const { error } = await supabase
        .from("profiles")
        .update({ push_token: token })
        .eq("id", userId);

      if (error) {
        console.error("Failed to save push token:", error.message);
        return null;
      }

      return token;
    } catch (error: any) {
      console.error("Full error:", error);
      return null;
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
              <ChevronLeft color={secondaryGray} />
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
          {currentStep === 4 && !notificationPermissionGranted && (
            <TouchableOpacity
              style={{
                marginTop: verticalScale(5),
                marginBottom: verticalScale(15),
              }}
              activeOpacity={1}
              onPress={handleOnboardingCompletion}
            >
              <Text
                style={{
                  color: textColor,
                  fontFamily: "Inter-Medium",
                  fontSize: moderateScale(14),
                }}
              >
                <FormattedMessage id={"no_thanks"} />
              </Text>
            </TouchableOpacity>
          )}
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
