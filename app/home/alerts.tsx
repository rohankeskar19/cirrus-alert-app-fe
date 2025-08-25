import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Alert,
  AlertType,
  createAlert,
  deleteAlert,
  fetchAllUserAlerts,
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
import TrashIcon from "@/assets/icons/trash.svg";

import AlertCard from "@/components/AlertCard";
import FilterModal from "@/components/AlertFilterModal";
import CreateAlertModal from "@/components/CreateAlertModal";
import ShimmerAlertCard from "@/components/ShimmerAlertCard";
import { useFocusEffect } from "expo-router";
import _ from "lodash";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);

type Row = { _type: "sticky" } | Alert;

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

  const initialFilter: FilterData = {
    status: "all",
    alertFrequency: ["immediate", "daily", "weekly"],
    sources: ["news", "reddit", "youtube"],
  };

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterData>(initialFilter);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  const [modalLoading, setModalLoading] = useState(false);

  const dataWithSticky: Row[] = [{ _type: "sticky" }, ...alerts];

  const intl = useIntl();

  useEffect(() => {
    loadAlerts();
  }, [appliedFilters]);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [])
  );

  const loadAlerts = async () => {
    try {
      setLoading(true);

      const alertsData = await fetchAllUserAlerts({
        status: appliedFilters.status,
        alertFrequency: appliedFilters.alertFrequency,
        sources: appliedFilters.sources,
        searchQuery,
      });
      setAlerts(alertsData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }, []);

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

  const handleCreateAlert = async (alert: Alert) => {
    try {
      setModalLoading(true);
      const success = await createAlert(
        alert.alert_text,
        alert.alert_sources,
        alert.alert_type
      );

      if (success) {
        setShowCreateModal(false);
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
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error updating alert:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingAlert(null);
  };

  const handleApplyFilters = (filters: FilterData) => {
    setAppliedFilters(filters);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setAppliedFilters({
      status: "all",
      alertFrequency: ["immediate", "daily", "weekly"],
      sources: ["news", "reddit", "youtube"],
    });
    setFilterModalVisible(false);
  };

  const handleLongPress = (alert: Alert) => {
    setIsSelectionMode(true);
    setSelectedAlerts(new Set([alert.id]));
  };

  const handleAlertPress = (alert: Alert) => {
    if (isSelectionMode) {
      const newSelectedAlerts = new Set(selectedAlerts);
      if (newSelectedAlerts.has(alert.id)) {
        newSelectedAlerts.delete(alert.id);
      } else {
        newSelectedAlerts.add(alert.id);
      }
      setSelectedAlerts(newSelectedAlerts);

      if (newSelectedAlerts.size === 0) {
        setIsSelectionMode(false);
      }
    }
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedAlerts(new Set());
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedAlerts.size;
    const alertTexts = alerts
      .filter((alert) => selectedAlerts.has(alert.id))
      .map((alert) => alert.alert_text)
      .slice(0, 3);

    RNAlert.alert(
      intl.formatMessage({
        id: selectedCount > 1 ? "delete_alerts" : "delete_alert",
      }),
      intl.formatMessage(
        {
          id:
            selectedCount > 1
              ? "are_you_sure_count_plural"
              : "are_you_sure_count_singular",
        },
        {
          count: selectedCount,
        }
      ),
      [
        { text: intl.formatMessage({ id: "cancel" }), style: "cancel" },
        {
          text: intl.formatMessage({ id: "delete" }),
          style: "destructive",
          onPress: async () => {
            try {
              const deletePromises = Array.from(selectedAlerts).map((alertId) =>
                deleteAlert(alertId)
              );

              const results = await Promise.all(deletePromises);
              const successfulDeletes = results.filter(
                (success) => success
              ).length;

              if (successfulDeletes > 0) {
                setAlerts((prev) =>
                  prev.filter((alert) => !selectedAlerts.has(alert.id))
                );
                setIsSelectionMode(false);
                setSelectedAlerts(new Set());
              }
            } catch (error) {
              console.error("Error deleting selected alerts:", error);
            }
          },
        },
      ]
    );
  };

  const renderAlertItem: ListRenderItem<Alert> = ({ item }) => (
    <AlertCard
      alert={item}
      onEdit={(alert) => {
        if (!isSelectionMode) {
          setShowEditModal(true);
          setEditingAlert(alert);
        }
      }}
      onToggle={(alertId: string, status) =>
        !isSelectionMode && handleToggleStatus(alertId, status)
      }
      onLongPress={handleLongPress}
      onPress={handleAlertPress}
      isSelected={selectedAlerts.has(item.id)}
      isSelectionMode={isSelectionMode}
    />
  );

  const renderTitleHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <View style={styles.titleLeft}>
          {isSelectionMode ? (
            <View style={styles.selectionHeader}>
              <Pressable onPress={handleCancelSelection}>
                <Text style={[styles.cancelText, { color: accentColor }]}>
                  <FormattedMessage id="cancel" />
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.title, { color: textColor }]}>
              <FormattedMessage id="my_alerts" />
            </Text>
          )}
        </View>
        {isSelectionMode && selectedAlerts.size > 0 && (
          <Pressable
            style={[styles.deleteButton]}
            onPress={handleDeleteSelected}
          >
            <TrashIcon width={20} height={20} color={textColor} />
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View
      style={{
        paddingHorizontal: horizontalScale(16),
        paddingTop: verticalScale(16),
      }}
    >
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: inputBg, borderColor },
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
        <Pressable onPress={() => setFilterModalVisible(true)}>
          <FilterIcon width={24} height={24} color={placeholderGray} />
          {!_.isEqual(appliedFilters, initialFilter) && (
            <View
              style={[styles.filterBubble, { backgroundColor: accentColor }]}
            />
          )}
        </Pressable>
      </View>
    </View>
  );

  const renderRow: ListRenderItem<Row> = ({ item }) => {
    if ("_type" in item && item._type === "sticky") {
      return (
        <View
          style={[styles.stickyWrapper, { backgroundColor: backgroundColor }]}
        >
          {renderSearchBar()}
        </View>
      );
    }
    return renderAlertItem({
      item: item as Alert,
      index: 0,
      separators: {} as any,
    });
  };

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
        <FlatList
          data={dataWithSticky}
          renderItem={renderRow}
          keyExtractor={(item, i) =>
            "_type" in item ? "sticky" : (item as Alert).id
          }
          ListHeaderComponent={renderTitleHeader}
          stickyHeaderIndices={[1]}
          ListEmptyComponent={
            loading ? renderShimmerContent() : renderEmptyState()
          }
          contentContainerStyle={[
            styles.contentContainer,
            alerts.length === 0 && styles.emptyContentContainer,
          ]}
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

      {!isSelectionMode && (
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
      )}
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
    paddingBottom: verticalScale(70),
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
  },
  titleSection: {
    height: verticalScale(60),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: moderateScale(38),
    fontFamily: "Inter-SemiBold",
    letterSpacing: -0.5,
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },
  selectionCount: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-SemiBold",
  },
  deleteButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconPlaceholder: {
    fontSize: moderateScale(20),
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
  shimmerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: verticalScale(14),
    paddingHorizontal: horizontalScale(18),
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
  filterBubble: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(100),
    position: "absolute",
    right: 0,
    top: -2,
  },
  stickyWrapper: {
    zIndex: 10,
    elevation: 0,
  },
});

export default AlertsTab;
