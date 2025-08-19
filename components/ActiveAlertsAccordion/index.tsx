import { useThemeColor } from "@/hooks/useThemeColor";
import { Alert } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import React from "react";
import { FormattedMessage } from "react-intl";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BookOpen from "@/assets/icons/book-open.svg";
import CalendarWeek from "@/assets/icons/calendar-week.svg";
import ThunderIcon from "@/assets/icons/thunder.svg";

type ActiveAlertsAccordionProps = {
  alerts: Alert[];
  isExpanded: boolean;
  onToggle: () => void;
  onAlertPress?: (alert: Alert) => void;
};

const ActiveAlertsAccordion = ({
  alerts,
  isExpanded,
  onToggle,
  onAlertPress,
}: ActiveAlertsAccordionProps) => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const borderColor = useThemeColor("inputBorder");
  const accentColor = useThemeColor("accentColor");
  const placeholderGray = useThemeColor("placeholderGray");

  const rotateValue = new Animated.Value(isExpanded ? 1 : 0);

  React.useEffect(() => {
    Animated.timing(rotateValue, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const getAlertTypeIcon = (alertType?: string) => {
    switch (alertType) {
      case "immediate":
        return <ThunderIcon width={18} height={18} color={textColor} />;
      case "daily":
        return <BookOpen width={18} height={18} color={textColor} />;
      default:
        return <CalendarWeek width={18} height={18} color={textColor} />;
    }
  };

  return (
    <View style={[styles.accordionContainer, { backgroundColor, borderColor }]}>
      <TouchableOpacity
        style={styles.accordionHeader}
        activeOpacity={1}
        onPress={onToggle}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerText}>
            <Text style={[styles.accordionTitle, { color: textColor }]}>
              <FormattedMessage id="active_alerts" />
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.countText, { color: accentColor }]}>
            <FormattedMessage
              id="active_alerts_count"
              values={{ count: alerts.length }}
            />
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.accordionContent}>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                <FormattedMessage id="no_active_alerts" />
              </Text>
            </View>
          ) : (
            <View style={styles.alertsList}>
              {alerts.map((alert, index) => (
                <View
                  key={alert.id}
                  style={[
                    styles.alertItem,
                    {
                      backgroundColor,
                      marginBottom: verticalScale(8),
                    },
                  ]}
                >
                  {getAlertTypeIcon(alert.alert_type)}
                  <Text
                    style={[styles.alertText, { color: textColor }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {alert.alert_text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    borderRadius: moderateScale(5),
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: verticalScale(16),
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: horizontalScale(16),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(12),
  },
  headerText: {
    flex: 1,
  },
  accordionTitle: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-SemiBold",
    lineHeight: moderateScale(20),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  countText: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-SemiBold",
  },
  accordionContent: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: verticalScale(32),
  },
  emptyStateTitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
    marginTop: verticalScale(12),
    marginBottom: verticalScale(4),
  },
  emptyStateSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: moderateScale(18),
  },
  alertsList: {
    gap: verticalScale(8),
  },
  alertItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  alertText: {
    width: "90%",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
    lineHeight: moderateScale(20),
    marginLeft: horizontalScale(13),
  },
});

export default ActiveAlertsAccordion;
