import AlertReportCard from "@/components/AlertReportCard";
import AlertReportFilterModal from "@/components/AlertReportFilterModal";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Alert,
  AlertReport,
  fetchActiveAlerts,
  fetchFilteredAlertReports,
  getReportsStats,
} from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import BackIcon from "@/assets/icons/chevron-left.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import ShimmerAlertReportCard from "@/components/ShimmerAlertReportCard";
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

const ViewAllReportsScreen = () => {
  const router = useRouter();
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");
  const secondaryGray = useThemeColor("secondaryGray");
  const dividerGray = useThemeColor("dividerGray");
  const inputBg = useThemeColor("inputBg");

  const intl = useIntl();

  const [reports, setReports] = useState<AlertReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterData, setFilterData] = useState<FilterData>({
    filterType: "all",
    selectedAlertId: "",
  });
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, read: 0 });
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const delayed = setTimeout(() => {
      if (searchQuery !== null) {
        loadReports(true);
      }
    }, 500);
    return () => clearTimeout(delayed);
  }, [searchQuery]);

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

  const loadReports = useCallback(
    async (reset: boolean = false) => {
      try {
        if (reset) setLoadingMore(false);
        else setLoadingMore(true);

        const offset = reset ? 0 : reports.length;

        const isReadFilter =
          filterData.filterType === "all"
            ? null
            : filterData.filterType === "read"
            ? true
            : false;

        const { data, count } = await fetchFilteredAlertReports(
          searchQuery,
          filterData.selectedAlertId || undefined,
          isReadFilter,
          ITEMS_PER_PAGE,
          offset
        );

        setReports(reset ? data : (prev) => [...prev, ...data]);
        setTotalCount(count);
        setHasMore(
          data.length === ITEMS_PER_PAGE && offset + data.length < count
        );
      } catch (e) {
        console.error("Error loading reports:", e);
      } finally {
        setLoadingMore(false);
      }
    },
    [searchQuery, filterData, reports.length]
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [alertsData, statsData] = await Promise.all([
          fetchActiveAlerts(),
          getReportsStats(),
        ]);
        setAlerts(alertsData);
        setStats(statsData);
        await loadReports(true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadReports]);

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

  const handleApplyFilters = (filters: FilterData) => {
    setFilterData(filters);
    loadReports(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterData({
      filterType: "all",
      selectedAlertId: "",
    });
  };

  const handleMarkAsRead = () => {
    loadReports(true);
  };

  const isFiltered =
    filterData.filterType !== "all" || filterData.selectedAlertId !== "";

  const renderReportItem: ListRenderItem<AlertReport> = ({ item, index }) => (
    <>
      <AlertReportCard alertReport={item} onMarkAsRead={handleMarkAsRead} />
      <View style={[styles.reportDivider, { backgroundColor: dividerGray }]} />
    </>
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
          <BackIcon width={18} height={18} color={secondaryGray} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: textColor }]}>
          <FormattedMessage id="all_matches" />
        </Text>
      </View>

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
          {isFiltered && (
            <View
              style={[styles.filterBubble, { backgroundColor: accentColor }]}
            />
          )}
        </Pressable>
      </View>

      <View style={[styles.statsBar, { backgroundColor }]}>
        <Text style={[styles.statsText, { color: secondaryGray }]}>
          <FormattedMessage id="reports_found" values={{ count: totalCount }} />
        </Text>
        <View style={styles.statsRight}>
          {stats.unread > 0 && (
            <View style={[styles.unreadBadge]}>
              <Text style={[styles.unreadBadgeText, { color: accentColor }]}>
                <FormattedMessage
                  id="count_unread"
                  values={{ count: stats.unread }}
                />
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
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

      <AlertReportFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        filterData={filterData}
        alerts={alerts}
        stats={stats}
      />
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
    paddingHorizontal: horizontalScale(14),
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(16),
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Medium",
    flex: 0.91,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  statsText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },
  statsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    paddingVertical: moderateScale(4),
  },
  unreadBadgeText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },
  contentContainer: {
    paddingBottom: verticalScale(20),
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
    paddingTop: verticalScale(8),
  },
  reportDivider: {
    width: "100%",
    height: verticalScale(1),
  },
  filterBubble: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(100),
    position: "absolute",
    right: 0,
    top: -2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    marginBottom: verticalScale(12),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
  },
});

export default ViewAllReportsScreen;
