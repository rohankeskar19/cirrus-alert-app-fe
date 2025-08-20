import { AlertType } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/useThemeColor";

import CircleCheck from "@/assets/icons/circle-check.svg";
import SearchIcon from "@/assets/icons/search.svg";
import ThunderIcon from "@/assets/icons/thunder.svg";
import TickIcon from "@/assets/icons/tick.svg";

type FilterStatus = "all" | "active" | "inactive";

type FilterData = {
  status: FilterStatus;
  alertFrequency: AlertType[];
  sources: string[];
};

const AlertFilterModal = ({
  visible,
  initialFilters,
  onClose,
  onApply,
  onReset,
}: {
  visible: boolean;
  initialFilters: FilterData;
  onClose: () => void;
  onApply: (filters: FilterData) => void;
  onReset: () => void;
}) => {
  const [filterData, setFilterData] = useState<FilterData>({
    status: "all",
    alertFrequency: ["immediate", "daily", "weekly"],
    sources: ["news", "blogs", "reddit", "youtube"],
  });

  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const inputBg = useThemeColor("inputBg");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");
  const secondaryGray = useThemeColor("secondaryGray");

  const statusOptions: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  const alertFrequencyOptions: { key: AlertType; label: string }[] = [
    { key: "immediate", label: "Immediate" },
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
  ];

  const sourceOptions: { key: string; label: string }[] = [
    { key: "news", label: "News" },
    { key: "blogs", label: "Blogs" },
    { key: "reddit", label: "Reddit" },
    { key: "youtube", label: "Youtube" },
  ];

  useEffect(() => {
    setFilterData(initialFilters);
  }, [initialFilters]);

  const handleStatusChange = (status: FilterStatus) => {
    setFilterData((prev) => ({ ...prev, status }));
  };

  const handleAlertFrequencyToggle = (frequency: AlertType) => {
    setFilterData((prev) => ({
      ...prev,
      alertFrequency: prev.alertFrequency.includes(frequency)
        ? prev.alertFrequency.filter((f) => f !== frequency)
        : [...prev.alertFrequency, frequency],
    }));
  };

  const handleSourceToggle = (source: string) => {
    setFilterData((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }));
  };

  const handleReset = () => {
    setFilterData({
      status: "all",
      alertFrequency: ["immediate", "daily", "weekly"],
      sources: ["news", "blogs", "reddit", "youtube"],
    });
    onReset();
  };

  const handleApply = () => {
    onApply(filterData);
    onClose();
  };

  const renderForm = () => (
    <ScrollView
      style={styles.formContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Status Section */}
      <View style={styles.formSection}>
        <View style={styles.formLabelContainer}>
          <CircleCheck width={20} height={20} />
          <Text style={[styles.formLabel, { color: textColor }]}>Status</Text>
        </View>

        <View style={[styles.statusGroup, { backgroundColor: inputBg }]}>
          {statusOptions.map((option) => (
            <Pressable
              key={option.key}
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    filterData.status === option.key ? accentColor : inputBg,
                  borderColor:
                    filterData.status === option.key ? accentColor : inputBg,
                },
              ]}
              onPress={() => handleStatusChange(option.key)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  {
                    color:
                      filterData.status === option.key
                        ? "#ffffff"
                        : placeholderGray,
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Alert Frequency Section */}
      <View style={styles.formSection}>
        <View style={styles.formLabelContainer}>
          <ThunderIcon width={20} height={20} />
          <Text style={[styles.formLabel, { color: textColor }]}>
            Alert frequency
          </Text>
        </View>

        <View style={styles.checkboxGroup}>
          {alertFrequencyOptions.map((option) => {
            const isSelected = filterData.alertFrequency.includes(option.key);
            return (
              <Pressable
                key={option.key}
                style={styles.checkboxOption}
                onPress={() => handleAlertFrequencyToggle(option.key)}
              >
                <View style={styles.checkboxContent}>
                  <View
                    style={[
                      styles.checkboxIndicator,
                      {
                        backgroundColor: isSelected
                          ? accentColor
                          : backgroundColor,
                        borderColor: isSelected ? accentColor : borderColor,
                      },
                    ]}
                  >
                    {isSelected && (
                      <TickIcon width={14} height={14} color={"#ffffff"} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.checkboxText,
                      {
                        color: textColor,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Sources Section */}
      <View style={styles.formSection}>
        <View style={styles.formLabelContainer}>
          <SearchIcon width={20} height={20} />
          <Text style={[styles.formLabel, { color: textColor }]}>Sources</Text>
        </View>

        <View style={styles.checkboxGroup}>
          {sourceOptions.map((option) => {
            const isSelected = filterData.sources.includes(option.key);
            return (
              <Pressable
                key={option.key}
                style={styles.checkboxOption}
                onPress={() => handleSourceToggle(option.key)}
              >
                <View style={styles.checkboxContent}>
                  <View
                    style={[
                      styles.checkboxIndicator,
                      {
                        backgroundColor: isSelected
                          ? accentColor
                          : backgroundColor,
                        borderColor: isSelected ? accentColor : borderColor,
                      },
                    ]}
                  >
                    {isSelected && (
                      <TickIcon width={14} height={14} color={"#ffffff"} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.checkboxText,
                      {
                        color: textColor,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={[styles.modalHeader]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>Filters</Text>
        </View>

        {renderForm()}

        <View style={styles.modalFooter}>
          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              {
                borderColor,
                backgroundColor: pressed ? borderColor + "20" : "transparent",
              },
            ]}
            onPress={handleReset}
          >
            <Text style={[styles.resetButtonText, { color: textColor }]}>
              Reset filters
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.applyButton,
              {
                backgroundColor: pressed ? accentColor + "CC" : accentColor,
              },
            ]}
            onPress={handleApply}
          >
            <Text style={[styles.applyButtonText, { color: "#ffffff" }]}>
              Apply filters
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
  formContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  formSection: {
    marginVertical: verticalScale(15),
  },
  formLabelContainer: {
    width: "100%",
    height: "auto",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  formLabel: {
    fontSize: moderateScale(22),
    fontFamily: "Inter-Medium",
    marginLeft: horizontalScale(10),
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusGroup: {
    flexDirection: "row",
    gap: horizontalScale(12),
    borderRadius: moderateScale(5),
    padding: moderateScale(5),
  },
  statusButton: {
    flex: 1,
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusButtonText: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Regular",
  },
  checkboxGroup: {
    gap: verticalScale(8),
  },
  checkboxOption: {
    paddingVertical: verticalScale(8),
  },
  checkboxContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(12),
  },
  checkboxIndicator: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(3),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: moderateScale(12),
    fontWeight: "bold",
  },
  checkboxText: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Regular",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    gap: horizontalScale(16),
  },
  resetButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    alignItems: "center",
  },
  resetButtonText: {
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

export default AlertFilterModal;
