import { Alert, AlertType } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/useThemeColor";

import EditIcon from "@/assets/icons/edit-pen.svg";
import SearchIcon from "@/assets/icons/search.svg";
import ThunderIcon from "@/assets/icons/thunder.svg";
import TickIcon from "@/assets/icons/tick.svg";

type AlertFormData = {
  alert_text: string;
  alert_sources: string[];
  alert_type: AlertType;
};

const CreateAlertModal = ({
  visible,
  isEdit,
  alert,
  loading,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  isEdit: boolean;
  alert: Alert | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (alert: Alert) => void;
}) => {
  const [formData, setFormData] = useState<AlertFormData>({
    alert_text: "",
    alert_sources: ["news", "blogs", "youtube", "reddit"],
    alert_type: "immediate",
  });

  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const inputBg = useThemeColor("inputBg");
  const placeholderGray = useThemeColor("placeholderGray");

  const intl = useIntl();

  useEffect(() => {
    if (alert) {
      setFormData({
        ...formData,
        alert_text: alert?.alert_text || "",
        alert_sources: alert?.alert_sources || [],
        alert_type: alert?.alert_type || "immediate",
      });
    }
  }, [alert]);

  const getAlertTypeLabel = (type: AlertType) => {
    switch (type) {
      case "immediate":
        return "Immediate";
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      default:
        return type;
    }
  };

  const renderForm = () => (
    <ScrollView
      style={styles.formContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formSection}>
        <View style={styles.formLabelContainer}>
          <EditIcon width={20} height={20} />
          <Text style={[styles.formLabel, { color: textColor }]}>
            <FormattedMessage id="alert_text_label" />
          </Text>
        </View>
        <TextInput
          style={[
            styles.formInput,
            {
              color: textColor,
              borderColor,
              backgroundColor: inputBg,
            },
          ]}
          value={formData.alert_text}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, alert_text: text }))
          }
          placeholder={intl.formatMessage({ id: "alert_text_placeholder" })}
          placeholderTextColor={placeholderGray}
          selectionColor={accentColor}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Alert Type - Simple Radio Buttons */}
      <View style={styles.formSection}>
        <View style={styles.formLabelContainer}>
          <ThunderIcon width={20} height={20} />
          <Text style={[styles.formLabel, { color: textColor }]}>
            <FormattedMessage id="alert_frequency_label" />
          </Text>
        </View>

        <View style={styles.radioGroup}>
          {(["immediate", "daily", "weekly"] as AlertType[]).map((type) => (
            <Pressable
              key={type}
              style={styles.radioOptionSimple}
              onPress={() =>
                setFormData((prev) => ({ ...prev, alert_type: type }))
              }
            >
              <View style={styles.radioOptionContent}>
                <View
                  style={[
                    styles.radioIndicator,
                    {
                      borderColor:
                        formData.alert_type === type
                          ? accentColor
                          : borderColor,
                    },
                  ]}
                >
                  {formData.alert_type === type && (
                    <View
                      style={[
                        styles.radioIndicatorInner,
                        { backgroundColor: accentColor },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioOptionText,
                    {
                      color:
                        formData.alert_type === type ? accentColor : textColor,
                    },
                  ]}
                >
                  {getAlertTypeLabel(type)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Alert Sources - Simple Checkboxes */}
      <View style={styles.formSection}>
        <View style={styles.formLabelContainer}>
          <SearchIcon width={20} height={20} />
          <Text style={[styles.formLabel, { color: textColor }]}>
            <FormattedMessage id="sources_to_monitor" />
          </Text>
        </View>

        <View style={styles.sourcesGrid}>
          {["news", "blogs", "youtube", "reddit"].map((source) => {
            const isSelected = formData.alert_sources.includes(source);
            return (
              <Pressable
                key={source}
                style={styles.sourceOptionSimple}
                onPress={() => {
                  setFormData((prev) => ({
                    ...prev,
                    alert_sources: prev.alert_sources.includes(source)
                      ? prev.alert_sources.filter((s) => s !== source)
                      : [...prev.alert_sources, source],
                  }));
                }}
              >
                <View style={styles.sourceOptionContent}>
                  <View
                    style={[
                      styles.checkboxIndicator,
                      {
                        backgroundColor: isSelected
                          ? accentColor
                          : "transparent",
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
                      styles.sourceOptionText,
                      {
                        color: isSelected ? accentColor : textColor,
                      },
                    ]}
                  >
                    {source.charAt(0).toUpperCase() + source.slice(1)}
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
          <Text style={[styles.modalTitle, { color: textColor }]}>
            <FormattedMessage id={isEdit ? "edit_alert" : "new_alert"} />
          </Text>
        </View>

        {renderForm()}

        <View style={styles.modalFooter}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              {
                borderColor,
                backgroundColor: pressed ? borderColor + "20" : "transparent",
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.cancelButtonText, { color: textColor }]}>
              <FormattedMessage id="cancel" />
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: loading
                  ? placeholderGray
                  : pressed
                  ? accentColor + "CC"
                  : accentColor,
              },
            ]}
            onPress={() => onSubmit(formData as Alert)}
            disabled={loading}
          >
            {loading && <ActivityIndicator size="small" color="#ffffff" />}
            <Text style={[styles.saveButtonText, { color: "#ffffff" }]}>
              <FormattedMessage id={isEdit ? "update" : "create"} />
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
  formInput: {
    borderWidth: 1,
    borderRadius: moderateScale(5),
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    textAlignVertical: "top",
    minHeight: verticalScale(80),
  },
  radioGroup: {
    gap: verticalScale(8),
  },
  radioOptionSimple: {
    paddingVertical: verticalScale(8),
  },
  radioOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(12),
  },
  radioIndicator: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioIndicatorInner: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
  },
  radioOptionText: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Regular",
  },
  sourcesGrid: {
    gap: verticalScale(8),
  },
  sourceOptionSimple: {
    paddingVertical: verticalScale(8),
  },
  sourceOptionContent: {
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
  sourceOptionText: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Regular",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    gap: horizontalScale(16),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Medium",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(5),
    gap: horizontalScale(8),
  },
  saveButtonText: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Medium",
  },
});

export default CreateAlertModal;
