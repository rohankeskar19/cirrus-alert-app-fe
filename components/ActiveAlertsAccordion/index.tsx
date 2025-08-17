import { useThemeColor } from "@/hooks/useThemeColor";
import { Alert } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ActiveAlertsAccordionProps = {
  alerts: Alert[];
  isExpanded: boolean;
  onToggle: () => void;
};

const ActiveAlertsAccordion = ({
  alerts,
  isExpanded,
  onToggle,
}: ActiveAlertsAccordionProps) => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const borderColor = useThemeColor("inputBorder");

  return (
    <TouchableOpacity
      style={[
        styles.activeAlertsContainer,
        {
          borderBottomColor: borderColor,
          borderTopColor: borderColor,
          borderRightColor: borderColor,
          borderLeftColor: borderColor,
        },
      ]}
      activeOpacity={1}
      onPress={onToggle}
    >
      <View style={[styles.activeAlertsHeader]}>
        <Text style={[styles.activeAlertsTitle, { color: textColor }]}>
          <FormattedMessage id="active_alerts" />
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.activeAlertsCount}>
            <FormattedMessage
              id="alerts_count"
              values={{ count: alerts.length }}
            />
          </Text>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.alertsContent}>
          {alerts.map((alert) => (
            <View
              key={alert.id}
              style={[styles.alertItem, { backgroundColor, borderColor }]}
            >
              <View style={styles.alertContent}>
                <Text
                  style={[styles.alertText, { color: textColor }]}
                  numberOfLines={1}
                >
                  {alert.alert_text}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  activeAlertsContainer: {
    borderRadius: moderateScale(17),
    borderWidth: 1,
    borderStyle: "solid",
    padding: moderateScale(16),
  },
  activeAlertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeAlertsTitle: {
    fontSize: moderateScale(15),
    fontFamily: "SpaceGrotesk-Medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeAlertsCount: {
    fontSize: moderateScale(14),
    color: "#2196F3",
    fontFamily: "SpaceGrotesk-Regular",
    marginRight: moderateScale(8),
  },
  alertsContent: {
    paddingTop: verticalScale(15),
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(7),
    paddingHorizontal: horizontalScale(13),
    marginBottom: verticalScale(8),
    borderRadius: moderateScale(100),
    borderWidth: 1.5,
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    fontSize: moderateScale(13),
    fontFamily: "SpaceGrotesk-Medium",
  },
});

export default ActiveAlertsAccordion;
