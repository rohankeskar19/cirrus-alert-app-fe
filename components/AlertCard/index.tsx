import { useThemeColor } from "@/hooks/useThemeColor";
import { Alert, AlertType } from "@/utils/apiUtils";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import BookOpen from "@/assets/icons/book-open.svg";
import CalendarWeek from "@/assets/icons/calendar-week.svg";
import EditIcon from "@/assets/icons/edit-pen.svg";
import SearchIcon from "@/assets/icons/search.svg";
import ThunderIcon from "@/assets/icons/thunder.svg";
import TickIcon from "@/assets/icons/tick.svg";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { FormattedMessage } from "react-intl";
import CirrusSwitch from "../Switch";

const AlertCard = ({
  alert,
  onEdit,
  onToggle,
  onLongPress,
  onPress,
  isSelected = false,
  isSelectionMode = false,
}: {
  alert: Alert;
  onEdit: (alert: Alert) => void;
  onToggle: (alertId: string, status: boolean) => void;
  onLongPress?: (alert: Alert) => void;
  onPress?: (alert: Alert) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}) => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const borderColor = useThemeColor("inputBorder");
  const secondaryGray = useThemeColor("secondaryGray");
  const accentColor = useThemeColor("accentColor");

  const getAlertTypeLabel = (alertType: AlertType) => {
    switch (alertType) {
      case "immediate":
        return "Immediate";
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      default:
        return "Unknown";
    }
  };

  const getAlertTypeIcon = (alertType?: string) => {
    switch (alertType) {
      case "immediate":
        return <ThunderIcon width={18} height={18} color={secondaryGray} />;
      case "daily":
        return <BookOpen width={18} height={18} color={secondaryGray} />;
      default:
        return <CalendarWeek width={18} height={18} color={secondaryGray} />;
    }
  };

  const handlePress = () => {
    if (isSelectionMode && onPress) {
      onPress(alert);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(alert);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={({ pressed }) => [
        styles.alertCard,
        {
          backgroundColor,
          borderColor: isSelected ? accentColor : borderColor,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={styles.alertTitleRow}>
            <Text
              style={[styles.alertTitle, { color: textColor }]}
              numberOfLines={2}
            >
              {alert.alert_text}
            </Text>
            {!isSelectionMode && (
              <CirrusSwitch
                isOn={alert.is_active}
                onToggle={() => onToggle(alert.id, alert.is_active)}
              />
            )}
            {isSelectionMode && (
              <View style={styles.selectionIndicator}>
                <View
                  style={[
                    styles.checkboxIndicator,
                    {
                      backgroundColor: isSelected ? accentColor : "transparent",
                      borderColor: isSelected ? accentColor : borderColor,
                    },
                  ]}
                >
                  {isSelected && (
                    <TickIcon width={16} height={16} color={"#ffffff"} />
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={styles.alertMetadata}>
            <View style={[styles.alertTypeContainer]}>
              {getAlertTypeIcon(alert.alert_type)}
              <Text style={[styles.alertTypeText, { color: secondaryGray }]}>
                {getAlertTypeLabel(alert.alert_type)}
              </Text>
            </View>

            <View style={styles.alertSources}>
              <SearchIcon width={16} height={16} color={secondaryGray} />
              {alert.alert_sources.slice(0, 2).map((source, index) => (
                <React.Fragment key={source}>
                  {index > 0 && (
                    <View
                      style={[
                        styles.sourceSeparator,
                        { backgroundColor: secondaryGray },
                      ]}
                    />
                  )}
                  <View style={[styles.alertSource]}>
                    <Text
                      style={[styles.alertSourceText, { color: secondaryGray }]}
                    >
                      {source}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
              {alert.alert_sources.length > 2 && (
                <>
                  <View
                    style={[
                      styles.sourceSeparator,
                      { backgroundColor: secondaryGray },
                    ]}
                  />
                  <View style={[styles.alertSource]}>
                    <Text
                      style={[styles.alertSourceText, { color: secondaryGray }]}
                    >
                      +{alert.alert_sources.length - 2}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {!isSelectionMode ? (
        <View style={styles.alertActions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.editButton,
              {
                borderColor,
                backgroundColor: pressed ? borderColor + "30" : "transparent",
              },
            ]}
            onPress={() => onEdit(alert)}
          >
            <EditIcon width={16} height={16} color={textColor} />
            <Text style={[styles.actionButtonText, { color: textColor }]}>
              <FormattedMessage id="edit" />
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.alertActionsPlaceholder}></View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    marginHorizontal: horizontalScale(16),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(5),
    padding: moderateScale(14),
    borderWidth: 2,
  },
  alertHeader: {
    marginBottom: verticalScale(16),
  },
  alertInfo: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(18),
  },
  alertTitle: {
    fontSize: moderateScale(23),
    fontFamily: "Inter-Medium",
    lineHeight: moderateScale(24),
    flex: 1,
    letterSpacing: -0.2,
  },
  selectionIndicator: {
    marginLeft: horizontalScale(8),
  },
  checkboxIndicator: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(3),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: moderateScale(14),
    fontWeight: "bold",
  },
  sourceSeparator: {
    width: 4,
    height: 4,
    borderRadius: 100,
  },
  alertMetadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  alertTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(6),
  },
  alertTypeText: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Regular",
    letterSpacing: 0.5,
  },
  alertSources: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: verticalScale(4),
  },
  alertSource: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
  },
  alertSourceText: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Regular",
    textTransform: "capitalize",
  },
  alertActions: {
    flexDirection: "row",
    height: verticalScale(50),
  },
  alertActionsPlaceholder: {
    height: verticalScale(50),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(5),
    gap: horizontalScale(6),
  },
  editButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
});

export default AlertCard;
