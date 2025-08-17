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
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BackIcon from "@/assets/icons/chevron-left.svg";
import CloseIcon from "@/assets/icons/cross.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import SearchIcon from "@/assets/icons/search.svg";
import SelectAllIcon from "@/assets/icons/select-all.svg";
import CheckIcon from "@/assets/icons/tick.svg";
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
        <TouchableOpacity
          style={[
            styles.selectionButton,
            {
              backgroundColor: selectedReports.includes(item.id)
                ? accentColor
                : backgroundColor,
              borderColor: accentColor,
            },
          ]}
          onPress={() => toggleReportSelection(item.id)}
        >
          {selectedReports.includes(item.id) && (
            <CheckIcon width={10} height={10} color="#ffffff" />
          )}
        </TouchableOpacity>
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
      <View style={[styles.headerBar]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <BackIcon width={24} height={24} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textColor }]}>
          <FormattedMessage id="all_reports" />
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerActionButton]}
            onPress={() => setSelectionMode(!selectionMode)}
          >
            <SelectAllIcon width={20} height={20} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerActionButton]}
            onPress={() => setShowFilters(true)}
          >
            <FilterIcon width={20} height={20} color={textColor} />
          </TouchableOpacity>
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
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <CloseIcon width={20} height={20} color={placeholderGray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.statsBar, { backgroundColor }]}>
        <Text style={[styles.statsText, { color: placeholderGray }]}>
          <FormattedMessage id="reports_found" values={{ count: totalCount }} />
        </Text>
        <View style={styles.statsRight}>
          <Text style={[styles.statsText, { color: placeholderGray }]}>
            <FormattedMessage
              id="count_unread"
              values={{ count: stats.unread }}
            />
          </Text>
        </View>
      </View>

      {selectionMode && (
        <View
          style={[
            styles.selectionBar,
            { backgroundColor: `${accentColor}10`, borderColor },
          ]}
        >
          <TouchableOpacity
            onPress={selectAllReports}
            style={styles.selectAllButton}
          >
            <Text style={[styles.selectAllText, { color: accentColor }]}>
              {selectedReports.length === reports.length
                ? "Deselect All"
                : "Select All"}
            </Text>
          </TouchableOpacity>

          {selectedReports.length > 0 && (
            <TouchableOpacity
              onPress={markSelectedAsRead}
              style={[
                styles.bulkActionButton,
                { backgroundColor: accentColor },
              ]}
            >
              <Text style={[styles.bulkActionText, { color: "#ffffff" }]}>
                <FormattedMessage
                  id="mark_as_read_count"
                  values={{ count: selectedReports.length }}
                />
              </Text>
            </TouchableOpacity>
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
        <View style={[styles.modalHeader]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            <FormattedMessage id="filters" />
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <CloseIcon width={24} height={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: textColor }]}>
              <FormattedMessage id="filter_by_status" />
            </Text>
            {[
              {
                key: "all",
                label: intl.formatMessage({ id: "all_reports" }),
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
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor:
                      filterType === option.key
                        ? `${accentColor}20`
                        : backgroundColor,
                    borderColor:
                      filterType === option.key
                        ? `${accentColor}20`
                        : borderColor,
                  },
                ]}
                activeOpacity={1}
                onPress={() => setFilterType(option.key as FilterType)}
              >
                <Text style={[styles.filterOptionText, { color: textColor }]}>
                  {option.label}
                </Text>
                <Text
                  style={[styles.filterOptionCount, { color: placeholderGray }]}
                >
                  {option.count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: textColor }]}>
              <FormattedMessage id="filter_by_alert" />
            </Text>
            <TouchableOpacity
              style={[
                styles.filterOption,
                {
                  backgroundColor: !selectedAlertId
                    ? `${accentColor}20`
                    : backgroundColor,
                  borderColor: !selectedAlertId
                    ? `${accentColor}20`
                    : borderColor,
                },
              ]}
              activeOpacity={1}
              onPress={() => setSelectedAlertId("")}
            >
              <Text style={[styles.filterOptionText, { color: textColor }]}>
                <FormattedMessage id="all_alerts" />
              </Text>
            </TouchableOpacity>
            {alerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor:
                      selectedAlertId === alert.id
                        ? `${accentColor}20`
                        : backgroundColor,
                    borderColor,
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
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearButtonText, { color: textColor }]}>
              <FormattedMessage id="clear_filters" />
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: accentColor }]}
            onPress={() => setShowFilters(false)}
          >
            <Text style={[styles.applyButtonText, { color: "#ffffff" }]}>
              <FormattedMessage id="apply_filters" />
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: placeholderGray }]}>
          <FormattedMessage id="loading_reports" />
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
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
  headerContainer: {
    paddingBottom: verticalScale(8),
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(13),
    paddingVertical: verticalScale(12),
  },
  backButton: {
    padding: moderateScale(8),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-SemiBold",
    flex: 1,
    textAlign: "center",
    marginRight: -horizontalScale(16),
  },
  headerActions: {
    flexDirection: "row",
    gap: horizontalScale(8),
  },
  headerActionButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: horizontalScale(16),
    marginVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(100),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    marginHorizontal: horizontalScale(8),
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
  },
  statsText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
  statsRight: {
    flexDirection: "row",
    gap: horizontalScale(16),
  },
  selectionBar: {
    height: verticalScale(60),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(12),
    marginVertical: verticalScale(12),
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  selectAllButton: {
    padding: moderateScale(4),
  },
  selectAllText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  bulkActionButton: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(100),
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
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(8),
  },
  selectionButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(12),
  },
  reportCardContainer: {
    flex: 1,
  },
  footerLoader: {
    alignItems: "center",
    paddingVertical: verticalScale(16),
  },
  footerLoaderText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
    marginTop: verticalScale(8),
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
  modalContent: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
  },
  filterSection: {
    marginVertical: verticalScale(16),
  },
  filterSectionTitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(12),
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(13),
    borderWidth: 1,
    marginBottom: verticalScale(8),
  },
  filterOptionText: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  filterOptionCount: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    gap: horizontalScale(12),
  },
  clearButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  applyButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(100),
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
});

export default ViewAllReportsScreen;
