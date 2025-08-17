import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Alert,
  AlertType,
  createAlert,
  deleteAlert,
  fetchAllUserAlerts,
  supabase,
  toggleAlertStatus,
  updateAlert,
} from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Modal,
  RefreshControl,
  Alert as RNAlert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BellIcon from "@/assets/icons/alerts-tab.svg";
import CloseIcon from "@/assets/icons/cross.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import EditIcon from "@/assets/icons/edit-pen.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import SearchIcon from "@/assets/icons/search.svg";
import SaveIcon from "@/assets/icons/tick.svg";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);

type AlertFormData = {
  alert_text: string;
  alert_sources: string[];
  alert_type: AlertType;
  similarity_threshold: number;
};

const AlertsTab = () => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");

  // State management
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "inactive">(
    "all"
  );

  // Form state
  const [formData, setFormData] = useState<AlertFormData>({
    alert_text: "",
    alert_sources: ["news", "blogs"],
    alert_type: "immediate",
    similarity_threshold: 0.5,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadAlerts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("alerts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const alertsData = await fetchAllUserAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = alert.alert_text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "active" && alert.is_active) ||
      (filterType === "inactive" && !alert.is_active);

    return matchesSearch && matchesFilter;
  });

  const handleToggleStatus = async (
    alertId: string,
    currentStatus: boolean
  ) => {
    try {
      const success = await toggleAlertStatus(alertId, !currentStatus);
      if (success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? { ...alert, is_active: !currentStatus }
              : alert
          )
        );
      }
    } catch (error) {
      console.error("Error toggling alert status:", error);
    }
  };

  const handleDeleteAlert = (alert: Alert) => {
    RNAlert.alert(
      "Delete Alert",
      `Are you sure you want to delete "${alert.alert_text}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteAlert(alert.id);
              if (success) {
                setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
              }
            } catch (error) {
              console.error("Error deleting alert:", error);
            }
          },
        },
      ]
    );
  };

  const handleCreateAlert = async () => {
    if (!formData.alert_text.trim()) {
      RNAlert.alert("Error", "Please enter alert text");
      return;
    }

    try {
      setFormLoading(true);
      const success = await createAlert(
        formData.alert_text,
        formData.alert_sources,
        formData.alert_type
      );

      if (success) {
        setShowCreateModal(false);
        resetForm();
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error creating alert:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAlert = async () => {
    if (!editingAlert || !formData.alert_text.trim()) {
      RNAlert.alert("Error", "Please enter alert text");
      return;
    }

    try {
      setFormLoading(true);
      const success = await updateAlert(editingAlert.id, {
        alert_text: formData.alert_text,
        alert_sources: formData.alert_sources,
        alert_type: formData.alert_type,
        similarity_threshold: formData.similarity_threshold,
      });

      if (success) {
        setShowEditModal(false);
        setEditingAlert(null);
        resetForm();
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error updating alert:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      alert_text: alert.alert_text,
      alert_sources: alert.alert_sources,
      alert_type: alert.alert_type,
      similarity_threshold: alert.similarity_threshold,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      alert_text: "",
      alert_sources: ["news", "blogs"],
      alert_type: "immediate",
      similarity_threshold: 0.5,
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingAlert(null);
    resetForm();
  };

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

  const renderAlertItem: ListRenderItem<Alert> = ({ item }) => (
    <View style={[styles.alertCard, { backgroundColor, borderColor }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={styles.alertTitleRow}>
            <Text
              style={[styles.alertTitle, { color: textColor }]}
              numberOfLines={2}
            >
              {item.alert_text}
            </Text>
            <Switch
              value={item.is_active}
              onValueChange={() => handleToggleStatus(item.id, item.is_active)}
              trackColor={{ false: borderColor, true: `#A7F55450` }}
              thumbColor={item.is_active ? "#A7F554" : placeholderGray}
            />
          </View>

          <View style={styles.alertMetadata}>
            <View
              style={[styles.alertTypeBadge, { backgroundColor: accentColor }]}
            >
              <Text style={[styles.alertTypeText, { color: "#ffffff" }]}>
                {getAlertTypeLabel(item.alert_type)}
              </Text>
            </View>

            <Text style={[styles.alertDate, { color: placeholderGray }]}>
              Created {dayjs(item.created_at).fromNow()}
            </Text>
          </View>

          <View style={styles.alertSources}>
            <Text
              style={[styles.alertSourcesLabel, { color: placeholderGray }]}
            >
              Sources:
            </Text>
            {item.alert_sources.map((source, index) => (
              <View
                key={source}
                style={[
                  styles.sourceTag,
                  {
                    backgroundColor: `${accentColor}10`,
                    borderColor: `${accentColor}30`,
                  },
                ]}
              >
                <Text style={[styles.sourceTagText, { color: accentColor }]}>
                  {source}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.alertActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton, { borderColor }]}
          onPress={() => openEditModal(item)}
        >
          <EditIcon width={16} height={16} color={textColor} />
          <Text style={[styles.actionButtonText, { color: textColor }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAlert(item)}
        >
          <DeleteIcon width={16} height={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <ScrollView style={styles.formContainer}>
      {/* Alert Text */}
      <View style={styles.formSection}>
        <Text style={[styles.formLabel, { color: textColor }]}>
          Alert Text *
        </Text>
        <TextInput
          style={[styles.formInput, { color: textColor, borderColor }]}
          value={formData.alert_text}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, alert_text: text }))
          }
          placeholder="Enter keywords or topics to monitor..."
          placeholderTextColor={placeholderGray}
          selectionColor={accentColor}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Alert Type */}
      <View style={styles.formSection}>
        <Text style={[styles.formLabel, { color: textColor }]}>
          Alert Frequency
        </Text>
        <View style={styles.radioGroup}>
          {(["immediate", "daily", "weekly"] as AlertType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.radioOption,
                {
                  backgroundColor:
                    formData.alert_type === type
                      ? `${accentColor}20`
                      : backgroundColor,
                  borderColor:
                    formData.alert_type === type ? accentColor : borderColor,
                },
              ]}
              onPress={() =>
                setFormData((prev) => ({ ...prev, alert_type: type }))
              }
            >
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
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Alert Sources */}
      <View style={styles.formSection}>
        <Text style={[styles.formLabel, { color: textColor }]}>
          Sources to Monitor
        </Text>
        <View style={styles.sourcesGrid}>
          {["news", "blogs", "youtube", "reddit"].map((source) => (
            <TouchableOpacity
              key={source}
              style={[
                styles.sourceOption,
                {
                  backgroundColor: formData.alert_sources.includes(source)
                    ? `${accentColor}20`
                    : backgroundColor,
                  borderColor: formData.alert_sources.includes(source)
                    ? accentColor
                    : borderColor,
                },
              ]}
              onPress={() => {
                setFormData((prev) => ({
                  ...prev,
                  alert_sources: prev.alert_sources.includes(source)
                    ? prev.alert_sources.filter((s) => s !== source)
                    : [...prev.alert_sources, source],
                }));
              }}
            >
              <Text
                style={[
                  styles.sourceOptionText,
                  {
                    color: formData.alert_sources.includes(source)
                      ? accentColor
                      : textColor,
                  },
                ]}
              >
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title and Create Button */}
      <View style={styles.titleSection}>
        <View style={styles.titleLeft}>
          <View>
            <Text style={[styles.title, { color: textColor }]}>Alerts</Text>
            <Text style={[styles.subtitle, { color: placeholderGray }]}>
              Manage your monitoring alerts
            </Text>
          </View>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={[styles.searchContainer, { backgroundColor, borderColor }]}>
        <SearchIcon width={20} height={20} color={placeholderGray} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search alerts..."
          placeholderTextColor={placeholderGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectionColor={accentColor}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: "all", label: "All", count: alerts.length },
          {
            key: "active",
            label: "Active",
            count: alerts.filter((a) => a.is_active).length,
          },
          {
            key: "inactive",
            label: "Inactive",
            count: alerts.filter((a) => !a.is_active).length,
          },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  filterType === tab.key ? accentColor : backgroundColor,
                borderColor: filterType === tab.key ? accentColor : borderColor,
              },
            ]}
            onPress={() => setFilterType(tab.key as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filterType === tab.key ? "#ffffff" : textColor },
              ]}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BellIcon width={48} height={48} color={placeholderGray} />
      <Text style={[styles.emptyStateTitle, { color: textColor }]}>
        No Alerts Yet
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: placeholderGray }]}>
        Create your first alert to start monitoring news and topics
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: placeholderGray }]}>
          Loading alerts...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={filteredAlerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            filteredAlerts.length === 0 ? renderEmptyState : null
          }
          contentContainerStyle={[
            styles.contentContainer,
            filteredAlerts.length === 0 && styles.emptyContentContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[accentColor]}
              tintColor={accentColor}
            />
          }
        />
      </SafeAreaView>

      {/* Create Alert Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View
            style={[styles.modalHeader, { borderBottomColor: borderColor }]}
          >
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Create Alert
            </Text>
            <TouchableOpacity onPress={closeCreateModal}>
              <CloseIcon width={24} height={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {renderForm()}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor }]}
              onPress={closeCreateModal}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: formLoading ? placeholderGray : accentColor,
                },
              ]}
              onPress={handleCreateAlert}
              disabled={formLoading}
            >
              {formLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <SaveIcon width={16} height={16} color="#ffffff" />
              )}
              <Text style={[styles.saveButtonText, { color: "#ffffff" }]}>
                {formLoading ? "Creating..." : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Edit Alert
            </Text>
            <TouchableOpacity onPress={closeEditModal}>
              <CloseIcon width={24} height={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {renderForm()}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor }]}
              onPress={closeEditModal}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: formLoading ? placeholderGray : accentColor,
                },
              ]}
              onPress={handleEditAlert}
              disabled={formLoading}
            >
              {formLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <SaveIcon width={16} height={16} color="#ffffff" />
              )}
              <Text style={[styles.saveButtonText, { color: "#ffffff" }]}>
                {formLoading ? "Updating..." : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: accentColor }]}
        onPress={() => setShowCreateModal(true)}
      >
        <PlusIcon width={20} height={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: verticalScale(20),
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16),
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(12),
  },
  title: {
    fontSize: moderateScale(28),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(34),
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(18),
    marginTop: verticalScale(2),
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(100),
    position: "absolute",
    bottom: verticalScale(120),
    right: horizontalScale(20),
  },
  createButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    marginBottom: verticalScale(12),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    marginLeft: horizontalScale(8),
  },
  filterTabs: {
    flexDirection: "row",
    gap: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  filterTab: {
    flex: 1,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    alignItems: "center",
  },
  filterTabText: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-SemiBold",
  },
  alertCard: {
    marginHorizontal: horizontalScale(16),
    marginBottom: verticalScale(12),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    padding: horizontalScale(16),
  },
  alertHeader: {
    marginBottom: verticalScale(12),
  },
  alertInfo: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(8),
  },
  alertTitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
    lineHeight: moderateScale(20),
    flex: 1,
    marginRight: horizontalScale(12),
  },
  alertMetadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
    gap: horizontalScale(8),
  },
  alertTypeBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  alertTypeText: {
    fontSize: moderateScale(11),
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alertDate: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },
  alertSources: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: horizontalScale(6),
    marginTop: verticalScale(13),
  },
  alertSourcesLabel: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },
  sourceTag: {
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(100),
    borderWidth: 1,
  },
  sourceTagText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
    textTransform: "capitalize",
  },
  alertActions: {
    flexDirection: "row",
    gap: horizontalScale(8),
    marginTop: verticalScale(16),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(100),
    gap: horizontalScale(4),
  },
  editButton: {
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  actionButtonText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
  emptyState: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(32),
  },
  emptyStateTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Bold",
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptyStateSubtitle: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(100),
    gap: horizontalScale(6),
  },
  emptyStateButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
    marginTop: verticalScale(12),
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-SemiBold",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
  },
  formSection: {
    marginVertical: verticalScale(16),
  },
  formLabel: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(8),
  },
  formInput: {
    borderWidth: 1,
    borderRadius: moderateScale(100),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    textAlignVertical: "top",
  },
  radioGroup: {
    gap: verticalScale(8),
  },
  radioOption: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: "center",
  },
  radioOptionText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  sourcesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(8),
  },
  sourceOption: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(6),
    borderWidth: 1,
    minWidth: horizontalScale(80),
    alignItems: "center",
  },
  sourceOptionText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    gap: horizontalScale(12),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(100),
    gap: horizontalScale(6),
  },
  saveButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
});

export default AlertsTab;
