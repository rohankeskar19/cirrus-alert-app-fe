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

import BellIcon from "@/assets/icons/alerts-tab.svg";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg";
import SearchIcon from "@/assets/icons/search.svg";

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
        return <BellIcon width={14} height={14} color={accentColor} />;
      case "search":
        return <SearchIcon width={14} height={14} color={placeholderGray} />;
      default:
        return <BellIcon width={14} height={14} color={accentColor} />;
    }
  };

  const getAlertTypeColor = (alertType?: string) => {
    switch (alertType) {
      case "immediate":
        return accentColor;
      case "search":
        return placeholderGray;
      default:
        return accentColor;
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
          <View style={[styles.countBadge, { backgroundColor: accentColor }]}>
            <Text style={[styles.countText, { color: "#ffffff" }]}>
              {alerts.length}
            </Text>
          </View>
          <Animated.View
            style={[styles.chevronContainer, { transform: [{ rotate }] }]}
          >
            <ChevronDownIcon width={20} height={20} color={placeholderGray} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.accordionContent}>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <BellIcon width={32} height={32} color={placeholderGray} />
              <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                <FormattedMessage id="no_active_alerts" />
              </Text>
              <Text
                style={[styles.emptyStateSubtitle, { color: placeholderGray }]}
              >
                <FormattedMessage id="create_first_alert" />
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
                  <View style={styles.alertContent}>
                    <View style={styles.alertHeader}>
                      <View style={styles.alertTypeContainer}>
                        {getAlertTypeIcon(alert.alert_type)}
                        <View
                          style={[
                            styles.alertTypeBadge,
                            {
                              backgroundColor: `${getAlertTypeColor(
                                alert.alert_type
                              )}20`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.alertTypeText,
                              { color: getAlertTypeColor(alert.alert_type) },
                            ]}
                          >
                            {alert.alert_type || "immediate"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text
                      style={[styles.alertText, { color: textColor }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {alert.alert_text}
                    </Text>

                    <View style={styles.alertMeta}>
                      <Text
                        style={[
                          styles.alertMetaText,
                          { color: placeholderGray },
                        ]}
                      >
                        <FormattedMessage
                          id="sources_count"
                          values={{ count: alert.alert_sources?.length }}
                        />
                      </Text>
                      <Text
                        style={[
                          styles.alertMetaText,
                          { color: placeholderGray },
                        ]}
                      >
                        <FormattedMessage
                          id="created"
                          values={{
                            created_at: new Date(
                              alert.created_at
                            ).toLocaleDateString(),
                          }}
                        />
                      </Text>
                    </View>
                  </View>
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
    borderRadius: moderateScale(16),
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
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
    lineHeight: moderateScale(20),
  },
  accordionSubtitle: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(16),
    marginTop: verticalScale(2),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  countBadge: {
    minWidth: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: horizontalScale(8),
  },
  countText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
  chevronContainer: {
    padding: moderateScale(4),
  },
  accordionContent: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(16),
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
    borderRadius: moderateScale(12),
  },
  alertContent: {},
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  alertTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(6),
  },
  alertTypeBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  alertTypeText: {
    fontSize: moderateScale(10),
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alertText: {
    width: "90%",
    fontSize: moderateScale(15),
    fontFamily: "Inter-SemiBold",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  alertMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertMetaText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },
  manageButton: {
    marginTop: verticalScale(16),
    borderWidth: 1,
    borderRadius: moderateScale(100),
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  manageButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
});

export default ActiveAlertsAccordion;
