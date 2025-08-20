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
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  Alert as RNAlert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import BellIcon from "@/assets/icons/alerts-tab.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import PlusIcon from "@/assets/icons/plus.svg";

import AlertCard from "@/components/AlertCard";
import FilterModal from "@/components/AlertFilterModal";
import CreateAlertModal from "@/components/CreateAlertModal";
import ShimmerAlertCard from "@/components/ShimmerAlertCard";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);

type FilterStatus = "all" | "active" | "inactive";

type FilterData = {
  status: FilterStatus;
  alertFrequency: AlertType[];
  sources: string[];
};

const AlertsTab = () => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const inputBg = useThemeColor("inputBg");
  const placeholderGray = useThemeColor("placeholderGray");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterData>({
    status: "all",
    alertFrequency: ["immediate", "daily", "weekly"],
    sources: ["news", "blogs", "reddit", "youtube"],
  });

  const [modalLoading, setModalLoading] = useState(false);

  const intl = useIntl();

  useEffect(() => {
    loadAlerts();

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
    // Search filter
    const matchesSearch = alert.alert_text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      appliedFilters.status === "all" ||
      (appliedFilters.status === "active" && alert.is_active) ||
      (appliedFilters.status === "inactive" && !alert.is_active);

    // Alert frequency filter
    const matchesFrequency = appliedFilters.alertFrequency.includes(
      alert.alert_type
    );

    // Sources filter - check if any of the alert's sources are in the filter
    const matchesSources = alert.alert_sources.some((source) =>
      appliedFilters.sources.includes(source)
    );

    return matchesSearch && matchesStatus && matchesFrequency && matchesSources;
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

  const handleCreateAlert = async (alert: Alert) => {
    if (!alert.alert_text.trim()) {
      RNAlert.alert("Error", "Please enter alert text");
      return;
    }

    try {
      setModalLoading(true);
      const success = await createAlert(
        alert.alert_text,
        alert.alert_sources,
        alert.alert_type
      );

      if (success) {
        setShowCreateModal(false);
        resetForm();
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error creating alert:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditAlert = async (alert: Alert) => {
    if (!editingAlert || !alert.alert_text.trim()) {
      RNAlert.alert("Error", "Please enter alert text");
      return;
    }

    try {
      setModalLoading(true);
      const success = await updateAlert(editingAlert.id, {
        alert_text: alert.alert_text,
        alert_sources: alert.alert_sources,
        alert_type: alert.alert_type,
        similarity_threshold: alert.similarity_threshold,
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
      setModalLoading(false);
    }
  };

  const openEditModal = (alert: Alert) => {
    setEditingAlert(alert);
    setShowEditModal(true);
  };

  const resetForm = () => {
    // Form reset logic if needed
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingAlert(null);
    resetForm();
  };

  const handleApplyFilters = (filters: FilterData) => {
    setAppliedFilters(filters);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setAppliedFilters({
      status: "all",
      alertFrequency: ["immediate", "daily", "weekly"],
      sources: ["news", "blogs", "reddit", "youtube"],
    });
    setFilterModalVisible(false);
  };

  const renderAlertItem: ListRenderItem<Alert> = ({ item }) => (
    <AlertCard
      alert={item}
      onEdit={(alert) => {
        setShowEditModal(true);
        setEditingAlert(alert);
      }}
      onToggle={() => {}}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.titleLeft}>
          <Text style={[styles.title, { color: textColor }]}>
            <FormattedMessage id="alerts" />
          </Text>
        </View>
      </View>

      {/* Search Container */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: inputBg,
            borderColor,
          },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={intl.formatMessage({ id: "search" })}
          placeholderTextColor={placeholderGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectionColor={accentColor}
        />
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <FilterIcon width={24} height={24} color={placeholderGray} />
        </Pressable>
      </View>
    </View>
  );

  const renderShimmerContent = () => (
    <View style={styles.shimmerContainer}>
      <ShimmerAlertCard />
      <ShimmerAlertCard />
      <ShimmerAlertCard />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: placeholderGray + "20" },
        ]}
      >
        <BellIcon width={32} height={32} color={placeholderGray} />
      </View>
      <Text style={[styles.emptyStateTitle, { color: textColor }]}>
        <FormattedMessage id="no_alerts_to_show" />
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <>
            {renderHeader()}
            {renderShimmerContent()}
          </>
        ) : (
          <>
            {renderHeader()}
            <FlatList
              data={filteredAlerts}
              renderItem={renderAlertItem}
              keyExtractor={(item) => item.id}
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
          </>
        )}
      </SafeAreaView>

      {/* Modals */}
      <CreateAlertModal
        visible={showEditModal || showCreateModal}
        alert={editingAlert}
        isEdit={showEditModal}
        loading={modalLoading}
        onSubmit={(alert: Alert) => {
          if (showEditModal) {
            handleEditAlert(alert);
          } else {
            handleCreateAlert(alert);
          }
        }}
        onClose={closeModal}
      />

      <FilterModal
        visible={filterModalVisible}
        initialFilters={appliedFilters}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Create Button */}
      <Pressable
        style={({ pressed }) => [
          styles.createButton,
          {
            backgroundColor: accentColor,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={() => setShowCreateModal(true)}
      >
        <PlusIcon width={24} height={24} color="#ffffff" />
      </Pressable>
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
    paddingBottom: verticalScale(120),
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(22),
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleIcon: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(16),
  },
  title: {
    fontSize: moderateScale(38),
    fontFamily: "Inter-SemiBold",
    letterSpacing: -0.5,
  },
  createButton: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: verticalScale(125),
    right: horizontalScale(20),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    marginBottom: verticalScale(18),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
  },
  filterTabs: {
    flexDirection: "row",
    gap: horizontalScale(5),
    marginBottom: verticalScale(8),
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(24),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    gap: horizontalScale(8),
  },
  filterTabText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  filterTabBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(100),
  },
  filterTabBadgeText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Bold",
  },
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
    marginBottom: verticalScale(23),
  },
  alertTitle: {
    fontSize: moderateScale(23),
    fontFamily: "Inter-Medium",
    lineHeight: moderateScale(24),
    flex: 1,
    letterSpacing: -0.2,
  },
  metaDivider: {
    width: 1,
    height: verticalScale(30),
    marginHorizontal: horizontalScale(10),
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
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  alertTypeText: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Regular",
    letterSpacing: 0.5,
  },
  alertDate: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
    opacity: 0.8,
  },
  alertSources: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: horizontalScale(8),
    marginTop: verticalScale(4),
  },
  alertSourcesLabel: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
    opacity: 0.8,
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
    borderRadius: moderateScale(100),
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

  // Shimmer styles
  shimmerContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  shimmerCard: {
    borderRadius: moderateScale(20),
    borderWidth: 1,
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
  },
  shimmerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(16),
  },
  shimmerTitle: {
    height: moderateScale(20),
    borderRadius: moderateScale(4),
    flex: 1,
    marginRight: horizontalScale(16),
  },
  shimmerSwitch: {
    width: moderateScale(44),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
  },
  shimmerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  shimmerBadge: {
    width: moderateScale(60),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
  },
  shimmerDate: {
    width: moderateScale(80),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  shimmerSources: {
    flexDirection: "row",
    gap: horizontalScale(8),
    marginBottom: verticalScale(16),
  },
  shimmeralertSource: {
    width: moderateScale(50),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
  },
  shimmerActions: {
    flexDirection: "row",
    gap: horizontalScale(12),
  },
  shimmerButton: {
    flex: 1,
    height: moderateScale(36),
    borderRadius: moderateScale(16),
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(40),
    paddingVertical: verticalScale(60),
  },
  emptyIconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
  },
  emptyStateTitle: {
    fontSize: moderateScale(24),
    fontFamily: "Inter-Bold",
    marginBottom: verticalScale(12),
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptyStateSubtitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    textAlign: "center",
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(32),
    opacity: 0.8,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(24),
    gap: horizontalScale(8),
  },
  emptyStateButtonText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Bold",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  modalTitle: {
    fontSize: moderateScale(22),
    fontFamily: "Inter-Bold",
    letterSpacing: -0.3,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  formSection: {
    marginVertical: verticalScale(10),
  },
  formLabel: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Bold",
    marginBottom: verticalScale(12),
    letterSpacing: -0.2,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: moderateScale(16),
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    textAlignVertical: "top",
    minHeight: verticalScale(80),
  },
  radioGroup: {
    gap: verticalScale(12),
  },
  radioOption: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
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
  },
  radioOptionText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  sourcesGrid: {
    gap: verticalScale(12),
  },
  sourceOption: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
  },
  sourceOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(12),
  },
  checkboxIndicator: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(4),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceOptionText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    gap: horizontalScale(16),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(100),
    gap: horizontalScale(8),
  },
  saveButtonText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
});

export default AlertsTab;
