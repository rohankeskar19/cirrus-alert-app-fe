import { useThemeColor } from "@/hooks/useThemeColor";
import { Alert } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "unread" | "read";

type FilterData = {
  filterType: FilterType;
  selectedAlertId: string;
};

type Stats = {
  total: number;
  unread: number;
  read: number;
};

const AlertReportFilterModal = ({
  visible,
  onClose,
  onApply,
  onClear,
  filterData,
  alerts,
  stats,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterData) => void;
  onClear: () => void;
  filterData: FilterData;
  alerts: Alert[];
  stats: Stats;
}) => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");

  const intl = useIntl();

  const [localFilterType, setLocalFilterType] = React.useState<FilterType>(
    filterData.filterType
  );
  const [localSelectedAlertId, setLocalSelectedAlertId] =
    React.useState<string>(filterData.selectedAlertId);

  React.useEffect(() => {
    setLocalFilterType(filterData.filterType);
    setLocalSelectedAlertId(filterData.selectedAlertId);
  }, [filterData]);

  const handleApply = () => {
    onApply({
      filterType: localFilterType,
      selectedAlertId: localSelectedAlertId,
    });
    onClose();
  };

  const handleClear = () => {
    setLocalFilterType("all");
    setLocalSelectedAlertId("");
    onClear();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            <FormattedMessage id="filters" />
          </Text>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: textColor }]}>
              <FormattedMessage id="filter_by_status" />
            </Text>
            {[
              {
                key: "all",
                label: intl.formatMessage({ id: "all_matches" }),
                count: stats.total,
              },
              {
                key: "unread",
                label: intl.formatMessage({ id: "unread" }),
                count: stats.unread,
              },
              {
                key: "read",
                label: intl.formatMessage({ id: "read" }),
                count: stats.read,
              },
            ].map((option) => (
              <Pressable
                key={option.key}
                style={({ pressed }) => [
                  styles.filterOption,
                  {
                    backgroundColor:
                      localFilterType === option.key
                        ? `${accentColor}20`
                        : pressed
                        ? borderColor + "40"
                        : backgroundColor,
                    borderColor:
                      localFilterType === option.key
                        ? accentColor
                        : borderColor,
                  },
                ]}
                onPress={() => setLocalFilterType(option.key as FilterType)}
              >
                <Text style={[styles.filterOptionText, { color: textColor }]}>
                  {option.label}
                </Text>
                <View
                  style={[
                    styles.filterCountBadge,
                    { backgroundColor: borderColor + "60" },
                  ]}
                >
                  <Text
                    style={[styles.filterOptionCount, { color: textColor }]}
                  >
                    {option.count}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: textColor }]}>
              <FormattedMessage id="filter_by_alert" />
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.filterOption,
                {
                  backgroundColor: !localSelectedAlertId
                    ? `${accentColor}20`
                    : pressed
                    ? borderColor + "40"
                    : backgroundColor,
                  borderColor: !localSelectedAlertId
                    ? accentColor
                    : borderColor,
                },
              ]}
              onPress={() => setLocalSelectedAlertId("")}
            >
              <Text style={[styles.filterOptionText, { color: textColor }]}>
                <FormattedMessage id="all_alerts" />
              </Text>
            </Pressable>
            {alerts.map((alert) => (
              <Pressable
                key={alert.id}
                style={({ pressed }) => [
                  styles.filterOption,
                  {
                    backgroundColor:
                      localSelectedAlertId === alert.id
                        ? `${accentColor}20`
                        : pressed
                        ? borderColor + "40"
                        : backgroundColor,
                    borderColor:
                      localSelectedAlertId === alert.id
                        ? accentColor
                        : borderColor,
                  },
                ]}
                onPress={() => setLocalSelectedAlertId(alert.id)}
              >
                <Text
                  style={[styles.filterOptionText, { color: textColor }]}
                  numberOfLines={2}
                >
                  {alert.alert_text}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Pressable
            style={({ pressed }) => [
              styles.clearButton,
              {
                borderColor,
                backgroundColor: pressed ? borderColor + "20" : "transparent",
              },
            ]}
            onPress={handleClear}
          >
            <Text style={[styles.clearButtonText, { color: textColor }]}>
              <FormattedMessage id="clear_filters" />
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.applyButton,
              {
                backgroundColor: accentColor,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={handleApply}
          >
            <Text style={[styles.applyButtonText, { color: "#ffffff" }]}>
              <FormattedMessage id="apply_filters" />
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(28),
    fontFamily: "Inter-SemiBold",
    letterSpacing: -0.3,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  filterSection: {
    marginVertical: verticalScale(20),
  },
  filterSectionTitle: {
    fontSize: moderateScale(22),
    fontFamily: "Inter-Medium",
    marginBottom: verticalScale(20),
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    marginBottom: verticalScale(12),
  },
  filterOptionText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    flex: 1,
  },
  filterCountBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(4),
  },
  filterOptionCount: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    gap: horizontalScale(16),
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(5),
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Medium",
  },
  applyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(5),
  },
  applyButtonText: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Medium",
  },
});

export default AlertReportFilterModal;
