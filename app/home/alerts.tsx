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
  Animated,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  RefreshControl,
  Alert as RNAlert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import BellIcon from "@/assets/icons/alerts-tab.svg";
import CloseIcon from "@/assets/icons/cross.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import EditIcon from "@/assets/icons/edit-pen.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import SearchIcon from "@/assets/icons/search.svg";
import SaveIcon from "@/assets/icons/tick.svg";
import { FormattedMessage } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);

type AlertFormData = {
  alert_text: string;
  alert_sources: string[];
  alert_type: AlertType;
  similarity_threshold: number;
};

// Shimmer Alert Card Component
const ShimmerAlertCard = () => {
  const backgroundColor = useThemeColor("background");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");

  const shimmerValue = new Animated.Value(0);

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const shimmerStyle = {
    opacity: shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={[styles.shimmerCard, { backgroundColor, borderColor }]}>
      <View style={styles.shimmerHeader}>
        <Animated.View
          style={[
            styles.shimmerTitle,
            shimmerStyle,
            { backgroundColor: placeholderGray + "40" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerSwitch,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
      </View>

      <View style={styles.shimmerMeta}>
        <Animated.View
          style={[
            styles.shimmerBadge,
            shimmerStyle,
            { backgroundColor: placeholderGray + "50" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerDate,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
      </View>

      <View style={styles.shimmerSources}>
        <Animated.View
          style={[
            styles.shimmerSourceTag,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerSourceTag,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerSourceTag,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
      </View>

      <View style={styles.shimmerActions}>
        <Animated.View
          style={[
            styles.shimmerButton,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerButton,
            shimmerStyle,
            { backgroundColor: placeholderGray + "30" },
          ]}
        />
      </View>
    </View>
  );
};

const AlertsTab = () => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");

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

  const [formData, setFormData] = useState<AlertFormData>({
    alert_text: "",
    alert_sources: ["news", "blogs"],
    alert_type: "immediate",
    similarity_threshold: 0.5,
  });
  const [formLoading, setFormLoading] = useState(false);

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

  const getAlertTypeColor = (alertType: AlertType) => {
    switch (alertType) {
      case "immediate":
        return accentColor;
      case "daily":
        return "#10B981";
      case "weekly":
        return "#F59E0B";
      default:
        return accentColor;
    }
  };

  const renderAlertItem: ListRenderItem<Alert> = ({ item }) => (
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
              {item.alert_text}
            </Text>
            <Switch
              value={item.is_active}
              onValueChange={() => handleToggleStatus(item.id, item.is_active)}
              trackColor={{
                false: borderColor + "80",
                true: accentColor + "40",
              }}
              thumbColor={item.is_active ? accentColor : placeholderGray}
              ios_backgroundColor={borderColor}
            />
          </View>

          <View style={styles.alertMetadata}>
            <View
              style={[
                styles.alertTypeBadge,
                {
                  backgroundColor: getAlertTypeColor(item.alert_type) + "20",
                  borderColor: getAlertTypeColor(item.alert_type) + "40",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getAlertTypeColor(item.alert_type) },
                ]}
              />
              <Text
                style={[
                  styles.alertTypeText,
                  { color: getAlertTypeColor(item.alert_type) },
                ]}
              >
                {getAlertTypeLabel(item.alert_type)}
              </Text>
            </View>

            <Text style={[styles.alertDate, { color: placeholderGray }]}>
              {dayjs(item.created_at).format("MMM D, YYYY")}
            </Text>
          </View>

          <View style={styles.alertSources}>
            <Text
              style={[styles.alertSourcesLabel, { color: placeholderGray }]}
            >
              Sources:
            </Text>
            {item.alert_sources.slice(0, 3).map((source, index) => (
              <View
                key={source}
                style={[
                  styles.sourceTag,
                  {
                    backgroundColor: borderColor + "40",
                  },
                ]}
              >
                <Text style={[styles.sourceTagText, { color: textColor }]}>
                  {source}
                </Text>
              </View>
            ))}
            {item.alert_sources.length > 3 && (
              <View
                style={[
                  styles.sourceTag,
                  { backgroundColor: borderColor + "60" },
                ]}
              >
                <Text style={[styles.sourceTagText, { color: textColor }]}>
                  +{item.alert_sources.length - 3}
                </Text>
              </View>
            )}
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
          onPress={() => openEditModal(item)}
        >
          <EditIcon width={16} height={16} color={textColor} />
          <Text style={[styles.actionButtonText, { color: textColor }]}>
            <FormattedMessage id="edit" />
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            {
              backgroundColor: pressed ? "#EF4444" + "20" : "#EF4444" + "10",
              borderColor: "#EF4444" + "30",
            },
          ]}
          onPress={() => handleDeleteAlert(item)}
        >
          <DeleteIcon width={16} height={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
            <FormattedMessage id="delete" />
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderForm = () => (
    <ScrollView
      style={styles.formContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Alert Text */}
      <View style={styles.formSection}>
        <Text style={[styles.formLabel, { color: textColor }]}>
          <FormattedMessage id="alert_text_label" />
        </Text>
        <TextInput
          style={[
            styles.formInput,
            {
              color: textColor,
              borderColor,
              backgroundColor: backgroundColor,
            },
          ]}
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
          <FormattedMessage id="alert_frequency_label" />
        </Text>
        <View style={styles.radioGroup}>
          {(["immediate", "daily", "weekly"] as AlertType[]).map((type) => (
            <Pressable
              key={type}
              style={({ pressed }) => [
                styles.radioOption,
                {
                  backgroundColor:
                    formData.alert_type === type
                      ? getAlertTypeColor(type) + "20"
                      : pressed
                      ? borderColor + "30"
                      : backgroundColor,
                  borderColor:
                    formData.alert_type === type
                      ? getAlertTypeColor(type)
                      : borderColor,
                },
              ]}
              onPress={() =>
                setFormData((prev) => ({ ...prev, alert_type: type }))
              }
            >
              <View style={[styles.radioOptionContent]}>
                <View
                  style={[
                    styles.radioIndicator,
                    {
                      backgroundColor:
                        formData.alert_type === type
                          ? getAlertTypeColor(type)
                          : "transparent",
                      borderColor:
                        formData.alert_type === type
                          ? getAlertTypeColor(type)
                          : borderColor,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.radioOptionText,
                    {
                      color:
                        formData.alert_type === type
                          ? getAlertTypeColor(type)
                          : textColor,
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

      {/* Alert Sources */}
      <View style={styles.formSection}>
        <Text style={[styles.formLabel, { color: textColor }]}>
          <FormattedMessage id="sources_to_monitor" />
        </Text>
        <View style={styles.sourcesGrid}>
          {["news", "blogs", "youtube", "reddit"].map((source) => (
            <Pressable
              key={source}
              style={({ pressed }) => [
                styles.sourceOption,
                {
                  backgroundColor: formData.alert_sources.includes(source)
                    ? accentColor + "20"
                    : pressed
                    ? borderColor + "30"
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
              <View style={styles.sourceOptionContent}>
                <View
                  style={[
                    styles.checkboxIndicator,
                    {
                      backgroundColor: formData.alert_sources.includes(source)
                        ? accentColor
                        : "transparent",
                      borderColor: formData.alert_sources.includes(source)
                        ? accentColor
                        : borderColor,
                    },
                  ]}
                >
                  {formData.alert_sources.includes(source) && (
                    <SaveIcon width={12} height={12} color="#ffffff" />
                  )}
                </View>
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
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.titleLeft}>
          <View
            style={[styles.titleIcon, { backgroundColor: accentColor + "15" }]}
          >
            <BellIcon width={24} height={24} color={accentColor} />
          </View>
          <View>
            <Text style={[styles.title, { color: textColor }]}>
              <FormattedMessage id="alerts" />
            </Text>
            <Text style={[styles.subtitle, { color: placeholderGray }]}>
              {alerts.length === 0
                ? "No alerts configured"
                : `${alerts.length} alert${
                    alerts.length !== 1 ? "s" : ""
                  } active`}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Container */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor,
            borderColor,
          },
        ]}
      >
        <SearchIcon width={20} height={20} color={placeholderGray} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search alerts..."
          placeholderTextColor={placeholderGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectionColor={accentColor}
        />
        {searchQuery.length > 0 && (
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => setSearchQuery("")}
          >
            <CloseIcon width={20} height={20} color={placeholderGray} />
          </Pressable>
        )}
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
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.filterTab,
              {
                backgroundColor:
                  filterType === tab.key
                    ? accentColor
                    : pressed
                    ? borderColor + "30"
                    : backgroundColor,
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
              {tab.label}
            </Text>
            <View
              style={[
                styles.filterTabBadge,
                {
                  backgroundColor:
                    filterType === tab.key ? "#ffffff30" : borderColor + "60",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterTabBadgeText,
                  { color: filterType === tab.key ? "#ffffff" : textColor },
                ]}
              >
                {tab.count}
              </Text>
            </View>
          </Pressable>
        ))}
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
        <FormattedMessage id="no_alerts_yet" />
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: placeholderGray }]}>
        <FormattedMessage id="create_first_alert" />
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.emptyStateButton,
          {
            backgroundColor: accentColor,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        onPress={() => setShowCreateModal(true)}
      >
        <PlusIcon width={16} height={16} color="#ffffff" />
        <Text style={[styles.emptyStateButtonText, { color: "#ffffff" }]}>
          <FormattedMessage id="create" />
        </Text>
      </Pressable>
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
        )}
      </SafeAreaView>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              <FormattedMessage id="create" />
            </Text>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              onPress={closeCreateModal}
            >
              <CloseIcon width={24} height={24} color={textColor} />
            </Pressable>
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
              onPress={closeCreateModal}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                <FormattedMessage id="cancel" />
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: formLoading
                    ? placeholderGray
                    : pressed
                    ? accentColor + "CC"
                    : accentColor,
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
                {formLoading ? "Creating..." : "Create Alert"}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              <FormattedMessage id="edit_alert" />
            </Text>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              onPress={closeEditModal}
            >
              <CloseIcon width={24} height={24} color={textColor} />
            </Pressable>
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
              onPress={closeEditModal}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                <FormattedMessage id="cancel" />
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: formLoading
                    ? placeholderGray
                    : pressed
                    ? accentColor + "CC"
                    : accentColor,
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
                <FormattedMessage id={formLoading ? "updating" : "update"} />
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Floating Create Button */}
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
    marginBottom: verticalScale(24),
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
    fontSize: moderateScale(32),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(38),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    lineHeight: moderateScale(20),
    marginTop: verticalScale(4),
    opacity: 0.8,
  },
  createButton: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: verticalScale(100),
    right: horizontalScale(20),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    marginBottom: verticalScale(20),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    marginLeft: horizontalScale(12),
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
    borderRadius: moderateScale(20),
    borderWidth: 1,
    padding: moderateScale(20),
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
    marginBottom: verticalScale(16),
  },
  alertTitle: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(24),
    flex: 1,
    marginRight: horizontalScale(16),
    letterSpacing: -0.2,
  },
  alertMetadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  alertTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    gap: horizontalScale(6),
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  alertTypeText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
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
  sourceTag: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  sourceTagText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
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
  shimmerSourceTag: {
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
