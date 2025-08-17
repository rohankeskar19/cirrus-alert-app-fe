import AlertReportCard from "@/components/AlertReportCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Alert,
  AlertReport,
  fetchActiveAlerts,
  fetchFilteredAlertReports,
  getReportsStats,
  markMultipleReportsAsRead,
} from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import BackIcon from "@/assets/icons/chevron-left.svg";
import CloseIcon from "@/assets/icons/cross.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import SearchIcon from "@/assets/icons/search.svg";
import SelectAllIcon from "@/assets/icons/select-all.svg";
import CheckIcon from "@/assets/icons/tick.svg";
import ShimmerAlertReportCard from "@/components/ShimmerAlertReportCard";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "unread" | "read";

const ViewAllReportsScreen = () => {
  const router = useRouter();
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");

  const intl = useIntl();

  // State management
  const [reports, setReports] = useState<AlertReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlertId, setSelectedAlertId] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });

  // Pagination
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== null) {
        loadReports(true);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedAlertId, filterType]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [alertsData, statsData] = await Promise.all([
        fetchActiveAlerts(),
        getReportsStats(),
      ]);

      setAlerts(alertsData);
      setStats(statsData);
      await loadReports(true);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoadingMore(false);
      } else {
        setLoadingMore(true);
      }

      const offset = reset ? 0 : reports.length;
      const isReadFilter = filterType === "all" ? null : filterType === "read";

      const { data, count } = await fetchFilteredAlertReports(
        searchQuery,
        selectedAlertId || undefined,
        isReadFilter,
        ITEMS_PER_PAGE,
        offset
      );

      if (reset) {
        setReports(data);
      } else {
        setReports((prev) => [...prev, ...data]);
      }

      setTotalCount(count);
      setHasMore(
        data.length === ITEMS_PER_PAGE && offset + data.length < count
      );
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadReports(false);
    }
  };

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports((prev) => {
      if (prev.includes(reportId)) {
        return prev.filter((id) => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  };

  const selectAllReports = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map((report) => report.id));
    }
  };

  const markSelectedAsRead = async () => {
    try {
      setLoading(true);
      const success = await markMultipleReportsAsRead(selectedReports);
      if (success) {
        setSelectedReports([]);
        setSelectionMode(false);
        await loadReports(true);
        await getReportsStats().then(setStats);
      }
    } catch (error) {
      console.error("Error marking reports as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedAlertId("");
    setFilterType("all");
    setShowFilters(false);
  };

  const renderReportItem: ListRenderItem<AlertReport> = ({ item, index }) => (
    <View style={styles.reportItemContainer}>
      {selectionMode && (
        <Pressable
          style={({ pressed }) => [
            styles.selectionButton,
            {
              backgroundColor: selectedReports.includes(item.id)
                ? accentColor
                : backgroundColor,
              borderColor: accentColor,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          onPress={() => toggleReportSelection(item.id)}
        >
          {selectedReports.includes(item.id) && (
            <CheckIcon width={12} height={12} color="#ffffff" />
          )}
        </Pressable>
      )}
      <View style={styles.reportCardContainer}>
        <AlertReportCard
          alertReport={item}
          onMarkAsRead={() => loadReports(true)}
        />
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerBar}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={() => router.back()}
        >
          <BackIcon width={24} height={24} color={textColor} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: textColor }]}>
          <FormattedMessage id="all_matches" />
        </Text>

        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.headerActionButton,
              {
                backgroundColor: pressed ? borderColor + "40" : "transparent",
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
            onPress={() => setSelectionMode(!selectionMode)}
          >
            <SelectAllIcon width={20} height={20} color={textColor} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.headerActionButton,
              {
                backgroundColor: pressed ? borderColor + "40" : "transparent",
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
            onPress={() => setShowFilters(true)}
          >
            <FilterIcon width={20} height={20} color={textColor} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor, borderColor }]}>
        <SearchIcon width={20} height={20} color={placeholderGray} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={intl.formatMessage({ id: "search_placeholder" })}
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

      <View style={[styles.statsBar, { backgroundColor }]}>
        <Text style={[styles.statsText, { color: placeholderGray }]}>
          <FormattedMessage id="reports_found" values={{ count: totalCount }} />
        </Text>
        <View style={styles.statsRight}>
          <View
            style={[
              styles.unreadBadge,
              { backgroundColor: accentColor + "20" },
            ]}
          >
            <Text style={[styles.unreadBadgeText, { color: accentColor }]}>
              <FormattedMessage
                id="count_unread"
                values={{ count: stats.unread }}
              />
            </Text>
          </View>
        </View>
      </View>

      {selectionMode && (
        <View
          style={[
            styles.selectionBar,
            {
              backgroundColor: `${accentColor}15`,
              borderColor: accentColor + "30",
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.selectAllButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={selectAllReports}
          >
            <Text style={[styles.selectAllText, { color: accentColor }]}>
              {selectedReports.length === reports.length
                ? "Deselect All"
                : "Select All"}
            </Text>
          </Pressable>

          {selectedReports.length > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.bulkActionButton,
                {
                  backgroundColor: accentColor,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
              onPress={markSelectedAsRead}
            >
              <Text style={[styles.bulkActionText, { color: "#ffffff" }]}>
                <FormattedMessage
                  id="mark_as_read_count"
                  values={{ count: selectedReports.length }}
                />
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            <FormattedMessage id="filters" />
          </Text>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => setShowFilters(false)}
          >
            <CloseIcon width={24} height={24} color={textColor} />
          </Pressable>
        </View>

        <View style={styles.modalContent}>
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
                      filterType === option.key
                        ? `${accentColor}20`
                        : pressed
                        ? borderColor + "40"
                        : backgroundColor,
                    borderColor:
                      filterType === option.key ? accentColor : borderColor,
                  },
                ]}
                onPress={() => setFilterType(option.key as FilterType)}
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
                  backgroundColor: !selectedAlertId
                    ? `${accentColor}20`
                    : pressed
                    ? borderColor + "40"
                    : backgroundColor,
                  borderColor: !selectedAlertId ? accentColor : borderColor,
                },
              ]}
              onPress={() => setSelectedAlertId("")}
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
                      selectedAlertId === alert.id
                        ? `${accentColor}20`
                        : pressed
                        ? borderColor + "40"
                        : backgroundColor,
                    borderColor:
                      selectedAlertId === alert.id ? accentColor : borderColor,
                  },
                ]}
                onPress={() => setSelectedAlertId(alert.id)}
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
        </View>

        <View style={styles.modalFooter}>
          <Pressable
            style={({ pressed }) => [
              styles.clearButton,
              {
                borderColor,
                backgroundColor: pressed ? borderColor + "20" : "transparent",
              },
            ]}
            onPress={clearFilters}
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
            onPress={() => setShowFilters(false)}
          >
            <Text style={[styles.applyButtonText, { color: "#ffffff" }]}>
              <FormattedMessage id="apply_filters" />
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderShimmerContent = () => (
    <View style={styles.shimmerContainer}>
      <ShimmerAlertReportCard />
      <ShimmerAlertReportCard />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={accentColor} />
        <Text style={[styles.footerLoaderText, { color: placeholderGray }]}>
          <FormattedMessage id="loading_more_reports" />
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        {loading ? (
          renderShimmerContent()
        ) : (
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.id}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[accentColor]}
                tintColor={accentColor}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
          />
        )}
      </SafeAreaView>

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {},
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(16),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Bold",
    flex: 1,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: horizontalScale(8),
  },
  headerActionButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: horizontalScale(20),
    marginBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(22),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(100),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    marginHorizontal: horizontalScale(12),
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
  },
  statsText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
  statsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  unreadBadgeText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
  selectionBar: {
    height: verticalScale(64),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    marginHorizontal: horizontalScale(20),
    marginVertical: verticalScale(12),
    borderRadius: moderateScale(16),
    borderWidth: 1,
  },
  selectAllButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
  },
  selectAllText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  bulkActionButton: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
  },
  bulkActionText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  contentContainer: {
    paddingBottom: verticalScale(20),
  },
  reportItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  selectionButton: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(16),
  },
  reportCardContainer: {
    flex: 1,
  },
  footerLoader: {
    alignItems: "center",
    paddingVertical: verticalScale(20),
    gap: verticalScale(8),
  },
  footerLoaderText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
  shimmerContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(8),
  },
  shimmerCard: {
    borderRadius: moderateScale(20),
    overflow: "hidden",
    marginBottom: verticalScale(20),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  shimmerImageContainer: {
    position: "relative",
    width: "100%",
    height: verticalScale(180),
  },
  shimmerImage: {
    width: "100%",
    height: "100%",
  },
  shimmerAlertTag: {
    position: "absolute",
    top: moderateScale(16),
    left: moderateScale(16),
    width: moderateScale(60),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
  },
  shimmerContent: {
    padding: moderateScale(20),
  },
  shimmerTitle: {
    height: moderateScale(24),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(8),
  },
  shimmerTitleSecond: {
    height: moderateScale(24),
    borderRadius: moderateScale(4),
    width: "70%",
    marginBottom: verticalScale(16),
  },
  shimmerMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  shimmerTime: {
    width: moderateScale(80),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  shimmerStats: {
    width: moderateScale(120),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  shimmerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shimmerSources: {
    flexDirection: "row",
    gap: horizontalScale(8),
  },
  shimmerSourceIcon: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
  },
  shimmerButton: {
    width: moderateScale(100),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Bold",
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
    fontSize: moderateScale(18),
    fontFamily: "Inter-Bold",
    marginBottom: verticalScale(16),
    letterSpacing: -0.2,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
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
    borderRadius: moderateScale(8),
  },
  filterOptionCount: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    gap: horizontalScale(16),
  },
  clearButton: {
    flex: 1,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  applyButton: {
    flex: 1,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(100),
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
});

export default ViewAllReportsScreen;
