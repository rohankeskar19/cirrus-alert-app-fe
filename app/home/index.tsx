import ActiveAlertsAccordion from "@/components/ActiveAlertsAccordion";
import AlertReportCard from "@/components/AlertReportCard";
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
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  FlatList,
  ListRenderItem,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ChevronRight from "@/assets/icons/chevron-right.svg";

const HomeTab = () => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");

  const [loading, setLoading] = useState(false);
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(false);
  const [alertReports, setAlertReports] = useState<AlertReport[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("alert_reports_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alert_reports",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAlertReports((prev) => [payload.new as AlertReport, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            setAlertReports((prev) =>
              prev.map((report) =>
                report.id === payload.new.id
                  ? (payload.new as AlertReport)
                  : report
              )
            );
          }

          if (payload.eventType === "DELETE") {
            setAlertReports((prev) =>
              prev.filter((report) => report.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const renderAlertReport: ListRenderItem<AlertReport> = ({ item }) => (
    <AlertReportCard alertReport={item} />
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: textColor }]}>
          {getGreetingMessage()}
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
            <FormattedMessage id="new_matches" />
          </Text>
          <View style={[styles.matchesBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.matchesBadgeText}>{alertReports.length}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={[styles.viewedLink, { color: accentColor }]}>
            <FormattedMessage id="viewed" />
          </Text>
          <ChevronRight color={accentColor} width={12} height={12} />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View
      style={[{ backgroundColor: backgroundColor }, styles.screenContainer]}
    >
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={alertReports}
          renderItem={renderAlertReport}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
  },
  contentContainer: {
    paddingBottom: verticalScale(20),
  },
  header: {
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(23),
  },
  greeting: {
    fontSize: moderateScale(30),
    fontFamily: "Inter-Medium",
  },
  newMatchesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  newMatchesTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Medium",
    marginRight: moderateScale(10),
  },
  matchesBadge: {
    borderRadius: moderateScale(100),
    width: moderateScale(30),
    height: moderateScale(30),
    alignItems: "center",
    justifyContent: "center",
  },
  matchesBadgeText: {
    color: "white",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },
  viewedLink: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Regular",
    marginRight: horizontalScale(10),
  },
  separator: {
    height: verticalScale(16),
  },
  viewAllButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default HomeTab;
