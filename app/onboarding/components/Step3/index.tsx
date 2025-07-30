import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { FormattedMessage, useIntl } from "react-intl";

import ShieldIcon from "@/assets/icons/shield-icon.svg";
import PermissionCard from "@/components/PermissionCard";
import { useAccessibilityPermission } from "@/hooks/useAccessibilityPermission";
import { useOverlayPermission } from "@/hooks/useOverlayPermission";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useUsageStatsPermission } from "@/hooks/useUsageStatsPermission";
import { moderateScale, verticalScale } from "@/utils/metrics";

const Step3 = () => {
  const onBackgroundColor = useThemeColor("onBackground");
  const onQuestStatColor = useThemeColor("questStat");

  const {
    requestPermission: requestUsageStatsPermission,
    permissionStatus: usageStatsPermissionStatus,
  } = useUsageStatsPermission();
  const {
    requestPermission: requestOverlayPermission,
    permissionStatus: overlayPermissionStatus,
  } = useOverlayPermission();
  const {
    requestPermission: requestAccessibilityPermission,
    permissionStatus: accessibilityPermissionStatus,
  } = useAccessibilityPermission();

  const intl = useIntl();

  console.log("Status ", usageStatsPermissionStatus);

  return (
    <View style={styles.stepContainer}>
      <View
        style={[
          {
            backgroundColor: onQuestStatColor,
          },
          styles.permissionCard,
        ]}
      >
        <View style={styles.iconContainer}>
          <ShieldIcon />
        </View>

        <View style={styles.textContainer}>
          <Text style={[{ color: onBackgroundColor }, styles.title]}>
            <FormattedMessage id="your_data_yours" />
          </Text>
          <Text style={[{ color: onBackgroundColor }, styles.subtitle]}>
            <FormattedMessage id="data_protection_label" />
          </Text>
        </View>
      </View>
      <PermissionCard
        permissionGranted={usageStatsPermissionStatus?.status == "approved"}
        permissionName={intl.formatMessage({ id: "usage_stats_permission" })}
        permissionReason={intl.formatMessage({ id: "usage_stats_reason" })}
        onClick={requestUsageStatsPermission}
      />
      <PermissionCard
        permissionGranted={overlayPermissionStatus?.status == "approved"}
        permissionName={intl.formatMessage({ id: "overlay_permission" })}
        permissionReason={intl.formatMessage({ id: "overlay_reason" })}
        onClick={requestOverlayPermission}
      />
      <PermissionCard
        permissionGranted={accessibilityPermissionStatus?.status == "approved"}
        permissionName={intl.formatMessage({ id: "accessibility_permission" })}
        permissionReason={intl.formatMessage({ id: "accessibility_reason" })}
        onClick={requestAccessibilityPermission}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: verticalScale(20),
    paddingBottom: verticalScale(40),
  },
  permissionCard: {
    borderRadius: moderateScale(16),
    padding: moderateScale(15),
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 2,
  },
  shieldIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#00c896",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "white",
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(20),
    fontFamily: "Outfit-SemiBold",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(18),
    fontFamily: "Outfit-Medium",
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

export default Step3;
