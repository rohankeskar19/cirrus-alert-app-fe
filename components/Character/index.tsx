import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { Easing } from "react-native-reanimated";

import {
  CharacterStates,
  StateAnimationConfig,
  getAnimationConfig,
} from "@/constants/CharacterStates";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

type DialogPosition = "bottom" | "right";

const BOBBING_DURATION = 2000;
const DIALOG_ANIMATION_DURATION = 300;
const TYPING_SPEED = 8;

interface AnimatedCharacterProps {
  dialogText: string;
  characterState: (typeof CharacterStates)[keyof typeof CharacterStates];
  dialogPosition?: DialogPosition;
  containerStyle?: StyleProp<ViewStyle>;
  characterContainerStyle?: StyleProp<ViewStyle>;
  dialogContainerStyle?: StyleProp<ViewStyle>;
  dialogTextStyle?: StyleProp<TextStyle>;
  animationDuration?: number;
  typingSpeed?: number;
  onAnimationComplete?: (state: string) => void;
  onTypingComplete?: () => void;
  forceRestart?: boolean;
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  dialogText,
  characterState = CharacterStates.IDLE,
  dialogPosition = "bottom",
  containerStyle,
  characterContainerStyle,
  dialogContainerStyle,
  dialogTextStyle,
  animationDuration = DIALOG_ANIMATION_DURATION,
  typingSpeed = TYPING_SPEED,
  onAnimationComplete,
  onTypingComplete,
  forceRestart = false,
}) => {
  const dialogScale = useRef(new Animated.Value(0)).current;
  const dialogTranslate = useRef(new Animated.Value(0)).current;
  const bobbingAnimation = useRef(new Animated.Value(0)).current;

  const [displayedText, setDisplayedText] = useState("");
  const [targetText, setTargetText] = useState(dialogText);
  const [isTyping, setIsTyping] = useState(false);
  const prevDialogTextRef = useRef<string | null>(null);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  const frameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevCharacterStateRef = useRef<string>(characterState);
  const animationKeyRef = useRef<string>(`${characterState}-${Date.now()}`);

  const { width } = Dimensions.get("window");

  const animationConfig = getAnimationConfig(characterState);
  const currentFrame = animationConfig.frames[currentFrameIndex];

  // Clear frame timeout
  const clearFrameTimeout = useCallback(() => {
    if (frameTimeoutRef.current) {
      clearTimeout(frameTimeoutRef.current);
      frameTimeoutRef.current = null;
    }
  }, []);

  // Clear typing timeout
  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  const scheduleNextFrame = useCallback(
    (
      config: StateAnimationConfig,
      frameIndex: number,
      animationKey: string,
    ) => {
      if (animationKeyRef.current !== animationKey) {
        return;
      }

      const frame = config.frames[frameIndex];
      const duration = frame.duration || config.defaultFrameDuration || 1000;

      frameTimeoutRef.current = setTimeout(() => {
        if (animationKeyRef.current !== animationKey) {
          return;
        }

        const nextIndex = (frameIndex + 1) % config.frames.length;

        switch (config.behavior) {
          case "loop":
            setCurrentFrameIndex(nextIndex);
            scheduleNextFrame(config, nextIndex, animationKey);
            break;

          case "once":
            if (frameIndex >= config.frames.length - 1) {
              setAnimationCompleted(true);
              onAnimationComplete?.(characterState);
            } else {
              setCurrentFrameIndex(nextIndex);
              scheduleNextFrame(config, nextIndex, animationKey);
            }
            break;

          case "hold_last":
            if (frameIndex < config.frames.length - 1) {
              setCurrentFrameIndex(nextIndex);
              scheduleNextFrame(config, nextIndex, animationKey);
            } else {
              // Hold on last frame
              setAnimationCompleted(true);
              onAnimationComplete?.(characterState);
            }
            break;
        }
      }, duration);
    },
    [characterState, onAnimationComplete],
  );

  // Typing animation function
  const startTypingAnimation = useCallback(
    (text: string) => {
      if (!text.trim()) {
        setDisplayedText("");
        setIsTyping(false);
        onTypingComplete?.();
        return;
      }

      setIsTyping(true);
      setDisplayedText("");
      let currentIndex = 0;

      const typeNextCharacter = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.substring(0, currentIndex + 1));
          currentIndex++;
          typingTimeoutRef.current = setTimeout(typeNextCharacter, typingSpeed);
        } else {
          setIsTyping(false);
          onTypingComplete?.();
        }
      };

      // Start typing after a small delay to let dialog animation complete
      typingTimeoutRef.current = setTimeout(
        typeNextCharacter,
        animationDuration,
      );
    },
    [typingSpeed, animationDuration, onTypingComplete],
  );

  useEffect(() => {
    const startBobbing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bobbingAnimation, {
            toValue: 1,
            duration: BOBBING_DURATION / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bobbingAnimation, {
            toValue: 0,
            duration: BOBBING_DURATION / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startBobbing();
  }, [bobbingAnimation]);

  useEffect(() => {
    const newAnimationKey = `${characterState}-${Date.now()}`;
    animationKeyRef.current = newAnimationKey;

    clearFrameTimeout();

    setAnimationCompleted(false);
    setCurrentFrameIndex(0);

    const config = getAnimationConfig(characterState);

    if (config.frames.length > 1) {
      scheduleNextFrame(config, 0, newAnimationKey);
    } else if (config.frames.length === 1) {
      if (config.behavior === "once" || config.behavior === "hold_last") {
        onAnimationComplete?.(characterState);
      }
    }

    prevCharacterStateRef.current = characterState;

    return () => {
      clearFrameTimeout();
    };
  }, [
    characterState,
    forceRestart,
    clearFrameTimeout,
    scheduleNextFrame,
    onAnimationComplete,
  ]);

  useEffect(() => {
    animateDialogIn();
    startTypingAnimation(dialogText);
  }, []);

  useEffect(() => {
    if (
      prevDialogTextRef.current !== null &&
      prevDialogTextRef.current !== dialogText
    ) {
      // Clear any ongoing typing animation
      clearTypingTimeout();

      // Animate out
      Animated.parallel([
        Animated.timing(dialogScale, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
          easing: Easing.exp,
        }),
        Animated.timing(dialogTranslate, {
          toValue: dialogPosition === "bottom" ? -20 : -20,
          duration: animationDuration / 2,
          useNativeDriver: true,
          easing: Easing.exp,
        }),
      ]).start(() => {
        setTargetText(dialogText);
        animateDialogIn();
        startTypingAnimation(dialogText);
      });
    } else if (prevDialogTextRef.current === null) {
      setTargetText(dialogText);
    }

    prevDialogTextRef.current = dialogText;
  }, [
    dialogText,
    animationDuration,
    dialogPosition,
    dialogScale,
    dialogTranslate,
    clearTypingTimeout,
    startTypingAnimation,
  ]);

  const animateDialogIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(dialogScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(dialogTranslate, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [dialogScale, dialogTranslate, animationDuration]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearFrameTimeout();
      clearTypingTimeout();
    };
  }, [clearFrameTimeout, clearTypingTimeout]);

  const isBottomPosition = dialogPosition === "bottom";

  const getTransformStyle = () => {
    if (isBottomPosition) {
      return [{ scale: dialogScale }, { translateY: dialogTranslate }];
    } else {
      return [{ scale: dialogScale }, { translateX: dialogTranslate }];
    }
  };

  const getBobTransform = () => {
    return {
      transform: [
        {
          translateY: bobbingAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -10],
          }),
        },
      ],
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.contentContainer,
          isBottomPosition
            ? styles.contentContainerBottom
            : styles.contentContainerRight,
        ]}
      >
        <Animated.View
          style={[
            styles.characterContainer,
            characterContainerStyle,
            getBobTransform(),
          ]}
        >
          {currentFrame?.icon || animationConfig.frames[0]?.icon}
        </Animated.View>

        <Animated.View
          style={[
            styles.dialogContainer,
            { opacity: targetText?.trim() ? 1 : 0 },
            isBottomPosition
              ? styles.dialogContainerBottom
              : styles.dialogContainerRight,
            dialogContainerStyle,
            {
              transform: getTransformStyle(),
              width: isBottomPosition ? "100%" : width * 0.6,
            },
          ]}
        >
          <Animated.Text style={[styles.dialogText, dialogTextStyle]}>
            {displayedText}
          </Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    position: "relative",
  },
  contentContainerBottom: {
    flexDirection: "column",
  },
  contentContainerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  characterContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  dialogContainer: {
    backgroundColor: "white",
    borderRadius: moderateScale(17),
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(18),
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#D0D0D0",
  },
  dialogContainerBottom: {
    marginTop: verticalScale(5),
  },
  dialogContainerRight: {
    marginLeft: horizontalScale(10),
  },
  dialogText: {
    fontSize: moderateScale(15),
    color: "#000000",
    fontFamily: "Outfit-Medium",
  },
  cursor: {
    opacity: 0.7,
  },
});

export default AnimatedCharacter;
