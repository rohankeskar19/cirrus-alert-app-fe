import ActiveAlertsAccordion from "@/components/ActiveAlertsAccordion";
import AlertReportCard from "@/components/AlertReportCard";
import ShimmerAlertReportCard from "@/components/ShimmerAlertReportCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Alert,
  AlertReport,
  fetchActiveAlerts,
  fetchUnreadAlertReports,
  supabase,
} from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { getGreetingMessage } from "@/utils/uiUtils";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Animated,
  FlatList,
  ListRenderItem,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import NewsIcon from "@/assets/icons/news.svg";

type Row = { _type: "sticky" } | AlertReport;

const HomeTab = () => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const placeholderGray = useThemeColor("placeholderGray");
  const dividerGray = useThemeColor("dividerGray");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(false);
  const [alertReports, setAlertReports] = useState<AlertReport[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    let subscription: any;

    const setupSubscription = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;
      const userId = session.user.id;

      fetchData();

      subscription = supabase
        .channel("alert-reports-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "alert_reports",
            filter: `alert_reports.user_id=eq.${userId}`,
          },
          async (payload) => {
            console.log("Realtime change in alert_reports:", payload);

            fetchData();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const alerts = await fetchActiveAlerts();
      setActiveAlerts(alerts);

      const reports = await fetchUnreadAlertReports();
      setAlertReports(reports);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleMarkAsRead = () => {
    fetchData();
  };

  const renderAlertReport: ListRenderItem<AlertReport> = ({ item, index }) => (
    <View>
      <AlertReportCard alertReport={item} onMarkAsRead={handleMarkAsRead} />
      <View style={[styles.reportDivider, { backgroundColor: dividerGray }]} />
    </View>
  );

  const renderShimmerContent = () => (
    <>
      <View style={[{ backgroundColor }, styles.stickyWrapper]}>
        {renderStickyHeader()}
      </View>
      <View style={styles.shimmerContainer}>
        <ShimmerAlertReportCard />
        <View
          style={[styles.reportDivider, { backgroundColor: dividerGray }]}
        />
        <ShimmerAlertReportCard />
        <View
          style={[styles.reportDivider, { backgroundColor: dividerGray }]}
        />
        <ShimmerAlertReportCard />
      </View>
    </>
  );

  const openViewAll = () => {
    router.push("/view-all-reports");
  };

  const renderEmptyState = () => (
    <>
      <View style={[{ backgroundColor }, styles.stickyWrapper]}>
        {renderStickyHeader()}
      </View>
      <View style={styles.emptyState}>
        <NewsIcon width={56} height={56} color={placeholderGray} />
        <Text style={[styles.emptyStateTitle, { color: textColor }]}>
          <FormattedMessage id="no_new_matches" />
        </Text>
        <Text style={[styles.emptyStateSubtitle, { color: placeholderGray }]}>
          <FormattedMessage id="we_will_notify" />
        </Text>
      </View>
    </>
  );

  const renderStickyHeader = () => (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor,
        },
      ]}
    >
      <ActiveAlertsAccordion
        alerts={activeAlerts}
        isExpanded={isAlertsExpanded}
        onToggle={() => setIsAlertsExpanded(!isAlertsExpanded)}
      />

      <View style={styles.newMatchesHeader}>
        <View style={styles.newMatchesTitle}>
          {!loading && alertReports.length > 0 && (
            <View
              style={[styles.matchesBadge, { backgroundColor: accentColor }]}
            >
              <Text style={styles.matchesBadgeText}>{alertReports.length}</Text>
            </View>
          )}
          {loading && (
            <Animated.View
              style={[
                styles.shimmerBadge,
                {
                  backgroundColor: placeholderGray + "40",
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.7],
                  }),
                },
              ]}
            />
          )}
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            <FormattedMessage id="unread_matches" />
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewAllButton}
            activeOpacity={1}
            onPress={openViewAll}
            disabled={loading}
          >
            <Text
              style={[
                styles.viewAllText,
                { color: loading ? placeholderGray : accentColor },
              ]}
            >
              <FormattedMessage id="view_all" />
            </Text>
            <ChevronRightIcon
              color={loading ? placeholderGray : accentColor}
              width={14}
              height={14}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const dataWithSticky: Row[] = [{ _type: "sticky" }, ...alertReports];

  const renderRow: ListRenderItem<Row> = ({ item }) => {
    if ("_type" in item && item._type === "sticky") {
      return (
        <View style={[{ backgroundColor }, styles.stickyWrapper]}>
          {renderStickyHeader()}
        </View>
      );
    }

    return renderAlertReport({
      item: item as AlertReport,
      index: 0,
      separators: undefined as any,
    });
  };
  return (
    <View style={[styles.screenContainer, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        {alertReports.length == 0 && !loading ? (
          <FlatList
            data={alertReports}
            renderItem={renderRow}
            ListHeaderComponent={
              <View style={styles.greetingSection}>
                <Text style={[styles.greeting, { color: textColor }]}>
                  {getGreetingMessage()}
                </Text>
                <Text style={[styles.subGreeting, { color: placeholderGray }]}>
                  <FormattedMessage id="stay_informed" />
                </Text>
              </View>
            }
            stickyHeaderIndices={[1]}
            ListEmptyComponent={
              loading ? renderShimmerContent() : renderEmptyState()
            }
            contentContainerStyle={[
              styles.contentContainer,
              alertReports.length === 0 && styles.emptyContentContainer,
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
        ) : (
          <FlatList
            data={dataWithSticky}
            renderItem={renderRow}
            keyExtractor={(item, i) =>
              "_type" in item ? "sticky" : (item as AlertReport).id.toString()
            }
            ListHeaderComponent={
              <View style={styles.greetingSection}>
                <Text style={[styles.greeting, { color: textColor }]}>
                  {getGreetingMessage()}
                </Text>
                <Text style={[styles.subGreeting, { color: placeholderGray }]}>
                  <FormattedMessage id="stay_informed" />
                </Text>
              </View>
            }
            stickyHeaderIndices={[1]}
            ListEmptyComponent={
              loading ? renderShimmerContent() : renderEmptyState()
            }
            contentContainerStyle={[
              styles.contentContainer,
              alertReports.length === 0 && styles.emptyContentContainer,
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
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: verticalScale(16),
  },
  headerContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(32),
  },
  contentContainer: {
    paddingBottom: verticalScale(80),
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  shimmerContainer: {
    flex: 1,
  },
  shimmerBadge: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(100),
    marginRight: horizontalScale(12),
  },
  greetingSection: {
    paddingTop: verticalScale(20),
    paddingHorizontal: horizontalScale(16),
  },
  greeting: {
    fontSize: moderateScale(38),
    fontFamily: "Inter-SemiBold",
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(20),
    marginTop: verticalScale(14),
    opacity: 0.8,
  },

  quickActionsContainer: {
    marginBottom: verticalScale(24),
  },
  quickActionsTitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(12),
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: horizontalScale(12),
  },
  quickActionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  quickActionIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(12),
  },
  quickActionText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  statsContainer: {
    borderRadius: moderateScale(16),
    borderWidth: 1,
    padding: horizontalScale(16),
    marginBottom: verticalScale(24),
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  statsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(8),
  },
  statsTitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: moderateScale(24),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(28),
  },
  statLabel: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
    marginTop: verticalScale(2),
  },
  statDivider: {
    width: 1,
    height: verticalScale(32),
    marginHorizontal: horizontalScale(16),
  },
  newMatchesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
    marginTop: verticalScale(8),
  },
  newMatchesTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Bold",
    marginRight: moderateScale(8),
  },
  matchesBadge: {
    minWidth: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(100),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: horizontalScale(8),
    marginRight: horizontalScale(12),
  },
  matchesBadgeText: {
    color: "#ffffff",
    fontSize: moderateScale(15),
    fontFamily: "Inter-SemiBold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  filterButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  viewAllText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  cardContainer: {
    paddingHorizontal: horizontalScale(16),
  },
  emptyState: {
    flex: 0.7,
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
  createAlertButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: horizontalScale(6),
  },
  createAlertButtonText: {
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
  reportDivider: {
    width: "100%",
    height: verticalScale(1),
  },
  stickyWrapper: {
    zIndex: 10,
    elevation: 0,
  },
});

export default HomeTab;
