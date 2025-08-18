import ActiveAlertsAccordion from "@/components/ActiveAlertsAccordion";
import AlertReportCard from "@/components/AlertReportCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Alert,
  AlertReport,
  fetchActiveAlerts,
  fetchUnreadAlertReports,
} from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { getGreetingMessage } from "@/utils/uiUtils";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  ActivityIndicator,
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

const HomeTab = () => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const placeholderGray = useThemeColor("placeholderGray");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(false);
  const [alertReports, setAlertReports] = useState<AlertReport[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

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
    <View style={styles.cardContainer}>
      <AlertReportCard alertReport={item} onMarkAsRead={handleMarkAsRead} />
    </View>
  );

  const openViewAll = () => {
    router.push("/view-all-reports");
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <NewsIcon width={48} height={48} color={placeholderGray} />
      <Text style={[styles.emptyStateTitle, { color: textColor }]}>
        <FormattedMessage id="no_new_matches" />
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: placeholderGray }]}>
        <FormattedMessage id="we_will_notify" />
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.greetingSection}>
        <Text style={[styles.greeting, { color: textColor }]}>
          {getGreetingMessage()}
        </Text>
        <Text style={[styles.subGreeting, { color: placeholderGray }]}>
          <FormattedMessage id="stay_informed" />
        </Text>
      </View>

      <ActiveAlertsAccordion
        alerts={activeAlerts}
        isExpanded={isAlertsExpanded}
        onToggle={() => setIsAlertsExpanded(!isAlertsExpanded)}
      />

      <View style={styles.newMatchesHeader}>
        <View style={styles.newMatchesTitle}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            <FormattedMessage
              id="new_matches"
              defaultMessage="Latest Reports"
            />
          </Text>
          {alertReports.length > 0 && (
            <View
              style={[styles.matchesBadge, { backgroundColor: accentColor }]}
            >
              <Text style={styles.matchesBadgeText}>{alertReports.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewAllButton}
            activeOpacity={1}
            onPress={openViewAll}
          >
            <Text style={[styles.viewAllText, { color: accentColor }]}>
              <FormattedMessage id="view_all" defaultMessage="View All" />
            </Text>
            <ChevronRightIcon color={accentColor} width={14} height={14} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && alertReports.length === 0) {
    return (
      <View style={[styles.screenContainer, { backgroundColor }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={[styles.loadingText, { color: placeholderGray }]}>
              <FormattedMessage id="loading_your_alerts" />
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.screenContainer, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <FlatList
          data={alertReports}
          renderItem={renderAlertReport}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            alertReports.length === 0 ? renderEmptyState : null
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
  },
  headerContainer: {
    paddingHorizontal: horizontalScale(16),
    marginTop: verticalScale(20),
  },
  contentContainer: {
    paddingBottom: verticalScale(80),
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  greetingSection: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(24),
  },
  greeting: {
    fontSize: moderateScale(32),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(38),
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    lineHeight: moderateScale(20),
    marginTop: verticalScale(4),
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
    minWidth: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: horizontalScale(8),
  },
  matchesBadgeText: {
    color: "#ffffff",
    fontSize: moderateScale(12),
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
});

export default HomeTab;
