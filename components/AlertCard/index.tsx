import { useThemeColor } from "@/hooks/useThemeColor";
import { Alert, AlertType } from "@/utils/apiUtils";
import { Pressable, StyleSheet, Text, View } from "react-native";

import EditIcon from "@/assets/icons/edit-pen.svg";

import SearchIcon from "@/assets/icons/search.svg";

import BookOpen from "@/assets/icons/book-open.svg";
import CalendarWeek from "@/assets/icons/calendar-week.svg";
import ThunderIcon from "@/assets/icons/thunder.svg";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { FormattedMessage } from "react-intl";
import CirrusSwitch from "../Switch";

const AlertCard = ({
  alert,
  onEdit,
  onToggle,
}: {
  alert: Alert;
  onEdit: (alert: Alert) => void;
  onToggle: (alertId: string, status: boolean) => void;
}) => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const borderColor = useThemeColor("inputBorder");

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
        return <ThunderIcon width={18} height={18} color={textColor} />;
      case "daily":
        return <BookOpen width={18} height={18} color={textColor} />;
      default:
        return <CalendarWeek width={18} height={18} color={textColor} />;
    }
  };

  return (
    <View
      style={[
        styles.alertCard,
        {
          backgroundColor,
          borderColor,
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
            <CirrusSwitch
              isOn={alert.is_active}
              onToggle={() => onToggle(alert.id, alert.is_active)}
            />
          </View>

          <View style={styles.alertMetadata}>
            <View style={[styles.alertTypeContainer]}>
              {getAlertTypeIcon(alert.alert_type)}
              <Text style={[styles.alertTypeText]}>
                {getAlertTypeLabel(alert.alert_type)}
              </Text>
            </View>

            <View style={styles.alertSources}>
              <SearchIcon width={16} height={16} color={borderColor} />
              {alert.alert_sources.slice(0, 2).map((source, index) => (
                <>
                  {index > 0 && (
                    <View
                      style={[
                        styles.sourceSeparator,
                        { backgroundColor: borderColor },
                      ]}
                    ></View>
                  )}
                  <View key={source} style={[styles.alertSource]}>
                    <Text
                      style={[styles.alertSourceText, { color: textColor }]}
                    >
                      {source}
                    </Text>
                  </View>
                </>
              ))}
              {alert.alert_sources.length > 2 && (
                <>
                  <View
                    style={[
                      styles.sourceSeparator,
                      { backgroundColor: borderColor },
                    ]}
                  ></View>
                  <View style={[styles.alertSource]}>
                    <Text
                      style={[styles.alertSourceText, { color: textColor }]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    marginHorizontal: horizontalScale(20),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    padding: moderateScale(14),
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
    gap: horizontalScale(12),
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
  deleteButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
});

export default AlertCard;
