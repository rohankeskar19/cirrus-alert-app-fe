import React, { useRef } from "react";

import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import TickWhiteIcon from "@/assets/icons/tick-white.svg";
import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale, verticalScale } from "@/utils/metrics";

const PermissionCard = ({
  permissionGranted,
  permissionName,
  permissionReason,
  onClick,
}: {
  permissionGranted: boolean;
  permissionName: string;
  permissionReason: string;
  onClick: () => void;
}) => {
  const onBackgroundColor = useThemeColor("onBackground");
  const onQuestStatColor = useThemeColor("questStat");
  const secondaryGray = useThemeColor("secondaryGray");
  const greenColor = useThemeColor("greenColor");
  const radioUntick = useThemeColor("radioUntick");

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.stepContainer}
      activeOpacity={1}
      onPress={onClick}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          {
            backgroundColor: onQuestStatColor,
            borderColor: secondaryGray,
            borderWidth: 2,
            transform: [{ scale: scaleAnim }],
          },
          styles.permissionCard,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: permissionGranted ? greenColor : radioUntick,
              borderColor: permissionGranted ? greenColor : secondaryGray,
              borderWidth: 2,
              borderRadius: moderateScale(100),
            },
          ]}
        >
          {permissionGranted && <TickWhiteIcon />}
        </View>

        <View style={styles.textContainer}>
          <Text style={[{ color: onBackgroundColor }, styles.title]}>
            {permissionName}
          </Text>
          <Text style={[{ color: onBackgroundColor }, styles.subtitle]}>
            {permissionReason}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: verticalScale(19),
  },
  permissionCard: {
    borderRadius: moderateScale(16),
    padding: moderateScale(15),
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: moderateScale(28),
    height: moderateScale(28),
    marginRight: 16,
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "white",
    fontSize: 20,
  },
  textContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: moderateScale(20),
    fontFamily: "Outfit-Medium",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    maxWidth: "90%",
    fontSize: moderateScale(18),
    fontFamily: "Outfit-Regular",
  },
  grantButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 16,
  },
});

export default PermissionCard;
