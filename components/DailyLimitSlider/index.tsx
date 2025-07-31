import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import FaceHappy from "@/assets/icons/face-happy.svg";
import FaceNeutral from "@/assets/icons/face-neutral.svg";
import FaceDead from "@/assets/icons/face-skull.svg";
import FaceZombie from "@/assets/icons/face-zombie.svg";
import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale } from "@/utils/metrics";

const { width: screenWidth } = Dimensions.get("window");

const DailyLimitSlider = ({
  defaultValue = 0,
  onValueChange = (value: number) => {},
}) => {
  const angle = (defaultValue / 720) * (2 * Math.PI);
  const [rotationAngle, setRotationAngle] = useState(angle);
  const lastAngleRef = useRef(angle);
  const isDraggingRef = useRef(false);
  const containerRef = useRef(null);

  const [center, setCenter] = useState({ x: 0, y: 0 });

  // Animation values for icons
  const iconScales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const [slotStates, setSlotStates] = useState([false, false, false, false]);

  const accentColor = useThemeColor("accentColor");
  const ringColor = useThemeColor("ringColor");
  const onBackgroundColor = useThemeColor("onBackground");

  const ringThickness = 5;
  const thumbThickness = 10;
  const iconSize = 40;
  const sliderSize = moderateScale(200);
  const containerSize = 250;

  const slotMeta = [
    { angle: 0, icon: FaceHappy },
    { angle: Math.PI / 2, icon: FaceNeutral },
    { angle: Math.PI, icon: FaceZombie },
    { angle: (3 * Math.PI) / 2, icon: FaceDead },
  ];

  useEffect(() => {
    // Trigger haptic feedback when angle changes
    // HapticFeedback.selectionChanged();
  }, [rotationAngle]);

  const triggerIconAnimation = (index: number) => {
    if (!slotStates[index]) {
      const newStates = [...slotStates];
      newStates[index] = true;
      setSlotStates(newStates);

      Animated.sequence([
        Animated.timing(iconScales[index], {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(iconScales[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        const resetStates = [...slotStates];
        resetStates[index] = false;
        setSlotStates(resetStates);
      });
    }
  };

  const normalizeAngle = (angle: number) => {
    let normalized = angle % (2 * Math.PI);
    if (normalized < 0) normalized += 2 * Math.PI;
    return normalized;
  };

  const angleToTime = (angle: number) => {
    const normalizedAngle = normalizeAngle(angle);
    const hours = (normalizedAngle / (2 * Math.PI)) * 12;
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours - wholeHours) * 60);

    if (wholeHours === 0 && minutes === 0) return "0h";
    if (wholeHours === 0) return `0h ${minutes}m`;
    if (minutes === 0) return `${wholeHours}h 0m`;
    return `${wholeHours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const angleToTimestamp = (angle: number) => {
    let normalizedAngle = angle % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    const hours = (normalizedAngle / (2 * Math.PI)) * 12;
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours - wholeHours) * 60);

    return wholeHours * 60 + minutes;
  };

  const calculateAngleFromTouch = (touchX: number, touchY: number) => {
    const center = { x: sliderSize / 2, y: sliderSize / 2 };
    const deltaX = touchX - center.x;
    const deltaY = touchY - center.y;

    let angle = Math.atan2(deltaY, deltaX) + Math.PI / 2;

    angle = normalizeAngle(angle);

    return angle;
  };

  const handleAngleChange = (newAngle: number) => {
    // Only apply jump prevention when dragging, not on initial touch
    if (isDraggingRef.current) {
      const lastAngle = lastAngleRef.current;
      let angleDiff = newAngle - lastAngle;

      // Handle wraparound (crossing 0/2π boundary)
      if (angleDiff > Math.PI) {
        angleDiff -= 2 * Math.PI;
      } else if (angleDiff < -Math.PI) {
        angleDiff += 2 * Math.PI;
      }

      // Increase threshold for more forgiving movement
      // Only prevent updates if the change is extremely large (more than 3/4 of a circle)
      if (Math.abs(angleDiff) < (3 * Math.PI) / 2) {
        setRotationAngle(newAngle);
        lastAngleRef.current = newAngle;
        onValueChange(angleToTimestamp(newAngle));

        // Check for slot proximity and trigger animations
        slotMeta.forEach((slot, index) => {
          const distance = Math.min(
            Math.abs(newAngle - slot.angle),
            Math.abs(newAngle - slot.angle + 2 * Math.PI),
            Math.abs(newAngle - slot.angle - 2 * Math.PI)
          );
          if (distance < 0.15) {
            triggerIconAnimation(index);
          }
        });
      }
    } else {
      // For initial touch, always allow the update
      setRotationAngle(newAngle);
      lastAngleRef.current = newAngle;
      onValueChange(angleToTimestamp(newAngle));
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const center = { x: sliderSize / 2, y: sliderSize / 2 };
      const distance = Math.sqrt(
        Math.pow(locationX - center.x, 2) + Math.pow(locationY - center.y, 2)
      );

      const maxRadius = containerSize / 2;
      return distance <= maxRadius;
    },

    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return (
        isDraggingRef.current ||
        Math.abs(gestureState.dx) > 2 ||
        Math.abs(gestureState.dy) > 2
      );
    },

    onPanResponderGrant: (evt) => {
      isDraggingRef.current = true;
      const { locationX, locationY } = evt.nativeEvent;
      const newAngle = calculateAngleFromTouch(locationX, locationY);

      handleAngleChange(newAngle);
    },

    onPanResponderMove: (evt) => {
      if (isDraggingRef.current) {
        const { locationX, locationY } = evt.nativeEvent;
        const newAngle = calculateAngleFromTouch(locationX, locationY);
        handleAngleChange(newAngle);
      }
    },

    onPanResponderRelease: () => {
      isDraggingRef.current = false;
    },

    onPanResponderTerminate: () => {
      isDraggingRef.current = false;
    },

    onPanResponderTerminationRequest: () => {
      return !isDraggingRef.current;
    },
  });

  const createArcPath = (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = {
      x: centerX + radius * Math.cos(startAngle),
      y: centerY + radius * Math.sin(startAngle),
    };
    const end = {
      x: centerX + radius * Math.cos(endAngle),
      y: centerY + radius * Math.sin(endAngle),
    };

    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const renderSlider = () => {
    const center = { x: sliderSize / 2, y: sliderSize / 2 };
    const radius = sliderSize / 2 - 20;

    const normalizedAngle = normalizeAngle(rotationAngle);
    // Start from top (12 o'clock position)
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + normalizedAngle;

    // Calculate thumb position
    const thumbAngle = rotationAngle - Math.PI / 2;
    const selectorX = center.x + Math.cos(thumbAngle) * radius;
    const selectorY = center.y + Math.sin(thumbAngle) * radius;

    return (
      <Svg width={sliderSize} height={sliderSize}>
        <Circle
          cx={center.x}
          cy={center.y}
          r={radius}
          stroke={ringColor}
          strokeWidth={ringThickness}
          fill="none"
        />

        {normalizedAngle > 0 && (
          <Path
            d={createArcPath(center.x, center.y, radius, startAngle, endAngle)}
            stroke={accentColor}
            strokeWidth={ringThickness}
            fill="none"
            strokeLinecap="round"
          />
        )}

        <Circle
          cx={selectorX}
          cy={selectorY}
          r={thumbThickness}
          fill={accentColor}
        />
      </Svg>
    );
  };

  const renderIcons = () => {
    const center = { x: containerSize / 2, y: containerSize / 2 };
    const iconRadius = sliderSize / 2 + 30;

    return slotMeta.map((slot, index) => {
      const adjustedAngle = slot.angle - Math.PI / 2;
      const iconX = center.x + Math.cos(adjustedAngle) * iconRadius;
      const iconY = center.y + Math.sin(adjustedAngle) * iconRadius;

      const Icon = slot.icon;

      return (
        <Animated.View
          key={index}
          style={[
            styles.iconContainer,
            {
              left: iconX - iconSize / 2,
              top: iconY - iconSize / 2,
              transform: [{ scale: iconScales[index] }],
            },
          ]}
        >
          <View style={styles.slotIcon}>
            <Icon />
          </View>
        </Animated.View>
      );
    });
  };

  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
        },
      ]}
    >
      <View style={styles.sliderContainer} {...panResponder.panHandlers}>
        {renderSlider()}
      </View>

      {renderIcons()}

      <View style={styles.textContainer}>
        <Text style={[styles.timeText, { color: onBackgroundColor }]}>
          {angleToTime(rotationAngle)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  sliderContainer: {
    position: "absolute",
  },
  iconContainer: {
    position: "absolute",
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  slotIcon: {
    width: moderateScale(45),
    height: moderateScale(45),
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    fontSize: moderateScale(24),
    fontFamily: "Outfit-SemiBold",
  },
});

export default DailyLimitSlider;
