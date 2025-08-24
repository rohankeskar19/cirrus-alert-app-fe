import SummaryContentRenderer from "@/components/SummaryContentRenderer";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AlertReport } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ArrowTopRight from "@/assets/icons/arrow-top-right.svg";
import BackIcon from "@/assets/icons/chevron-left.svg";
import ExternalLinkIcon from "@/assets/icons/external-link.svg";
import Favicon from "@/components/FavIcon";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);

const ViewReportScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const alertReport: AlertReport = JSON.parse(params.report as string);

  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");

  const matches = alertReport.matches_data ?? ([] as any);
  const featuredMatch = matches.find((m: any) => m.images?.featured) || null;

  const featuredImage =
    featuredMatch?.images?.featured ?? "https://via.placeholder.com/400x200";

  const featuredSource = featuredMatch || matches[0];

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={1}
        >
          <BackIcon width={18} height={18} color={textColor} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: featuredImage }} style={styles.featuredImage} />
          {featuredSource && (
            <TouchableOpacity
              style={[
                styles.sourceCredit,
                { backgroundColor: "rgba(0,0,0,0.6)" },
              ]}
              onPress={() =>
                featuredSource.url && Linking.openURL(featuredSource.url)
              }
              activeOpacity={1}
            >
              <Image
                source={{
                  uri:
                    featuredSource.favicon ||
                    `https://www.google.com/s2/favicons?sz=64&domain_url=${featuredSource.domain}`,
                }}
                style={styles.sourceCreditFavicon}
              />
              <Text style={styles.sourceCreditText} numberOfLines={1}>
                {featuredSource.domain}
              </Text>
              <ArrowTopRight />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.reportTitle, { color: textColor }]}>
            {alertReport.title}
          </Text>
          <Text style={[styles.alertTagText, { color: accentColor }]}>
            {alertReport.alerts?.alert_text}
          </Text>
          <View style={styles.metadataContainer}>
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: placeholderGray }]}>
                {dayjs(alertReport.generated_at).fromNow()}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <Text style={[styles.statsText, { color: placeholderGray }]}>
                {alertReport.summary_content?.metadata?.reading_time_minutes ||
                  2}{" "}
                min read
              </Text>
              <Text style={[styles.statsDivider, { color: placeholderGray }]}>
                •
              </Text>
              <Text style={[styles.statsText, { color: placeholderGray }]}>
                {alertReport.match_count} sources
              </Text>
            </View>
          </View>
          {alertReport.summary_content && (
            <SummaryContentRenderer
              summaryContent={alertReport.summary_content as any}
              matchesData={alertReport.matches_data || ([] as any)}
            />
          )}
          <View style={styles.sourcesSection}>
            <Text style={[styles.sourcesTitle, { color: textColor }]}>
              Sources ({alertReport.match_count})
            </Text>

            {matches.map((source: any, index: number) => (
              <TouchableOpacity
                key={`source-${index}`}
                style={[styles.sourceItem, { borderBottomColor: borderColor }]}
                onPress={() => source.url && Linking.openURL(source.url)}
                activeOpacity={0.7}
              >
                <View style={styles.sourceContent}>
                  <Favicon
                    uri={
                      source.favicon ||
                      `https://www.google.com/s2/favicons?sz=64&domain_url=${source.domain}`
                    }
                    style={styles.sourceFavicon}
                  />

                  <View style={styles.sourceTextContainer}>
                    <Text
                      style={[styles.sourceTitle, { color: textColor }]}
                      numberOfLines={2}
                    >
                      {source.title}
                    </Text>
                    <Text
                      style={[styles.sourceDomain, { color: placeholderGray }]}
                    >
                      {source.domain} •{" "}
                      {source.published_at
                        ? dayjs(source.published_at).fromNow()
                        : "Recently"}
                    </Text>
                  </View>
                  <ExternalLinkIcon
                    width={16}
                    height={16}
                    color={placeholderGray}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  header: {
    width: "100%",
    height: verticalScale(60),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(14),
  },
  backButton: {
    height: "100%",
    marginVertical: "auto",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-SemiBold",
    flex: 1,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: verticalScale(200),
    resizeMode: "cover",
  },
  imageCreditOverlay: {
    position: "absolute",
    bottom: moderateScale(12),
    right: moderateScale(12),
    borderRadius: moderateScale(8),
    padding: moderateScale(8),
  },
  creditContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  creditFavicon: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    marginRight: horizontalScale(6),
  },
  creditText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
    marginRight: horizontalScale(4),
  },
  contentContainer: {
    padding: moderateScale(16),
  },
  reportTitle: {
    fontSize: moderateScale(24),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(32),
    marginBottom: verticalScale(13),
  },
  alertTagText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(16),
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
    marginLeft: horizontalScale(6),
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
  statsDivider: {
    fontSize: moderateScale(14),
    marginHorizontal: horizontalScale(8),
  },
  sourcesSection: {
    marginTop: verticalScale(32),
    paddingTop: verticalScale(24),
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  sourcesTitle: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(16),
  },
  sourceItem: {
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
  },
  sourceContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceFavicon: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    marginRight: horizontalScale(12),
  },
  sourceTextContainer: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-SemiBold",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(2),
  },
  sourceDomain: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Regular",
  },
  moreSourcesText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginTop: verticalScale(16),
  },
  sourceCredit: {
    position: "absolute",
    bottom: moderateScale(12),
    right: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
  },
  sourceCreditFavicon: {
    width: moderateScale(16),
    height: moderateScale(16),
    marginRight: horizontalScale(6),
    borderRadius: moderateScale(4),
  },
  sourceCreditText: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
    color: "#ffffff",
    marginRight: horizontalScale(8),
    opacity: 0.75,
  },
});

export default ViewReportScreen;
