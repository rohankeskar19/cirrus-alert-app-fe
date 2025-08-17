import { useThemeColor } from "@/hooks/useThemeColor";
import { AlertReport, markAlertReportAsRead } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ClockIcon from "@/assets/icons/clock.svg";
import TickIcon from "@/assets/icons/tick.svg";

import { FormattedMessage } from "react-intl";

dayjs.extend(relativeTime);

type AlertReportCardProps = {
  alertReport: AlertReport;
  onMarkAsRead?: () => void;
};

const AlertReportCard = ({
  alertReport,
  onMarkAsRead,
}: AlertReportCardProps) => {
  const router = useRouter();
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");

  const matches = alertReport.matches_data ?? ([] as any);
  const featuredImage =
    matches[0]?.images?.featured ?? "https://via.placeholder.com/400x200";
  const featuredSource = matches[0];

  const sourceIcons = matches.slice(0, 4).map((match: any, index: number) => ({
    key: `favicon-${index}`,
    favicon:
      match.favicon ||
      `https://www.google.com/s2/favicons?sz=64&domain_url=${match.domain}`,
    domain: match.domain,
  }));

  const extraSourceCount = matches.length > 4 ? matches.length - 4 : 0;
  const alertText = alertReport.alerts?.alert_text ?? "Alert";
  const readingTime =
    alertReport.summary_content?.metadata?.reading_time_minutes || 2;

  const markAsRead = async (event: any) => {
    event.stopPropagation();
    try {
      await markAlertReportAsRead(alertReport.id);
      onMarkAsRead?.();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleCardPress = () => {
    router.push({
      pathname: "/view-report",
      params: {
        report: JSON.stringify(alertReport),
      },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.newsCard, { backgroundColor, borderColor }]}
      activeOpacity={0.95}
      onPress={handleCardPress}
    >
      {/* Featured Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: featuredImage }} style={styles.featuredImage} />

        {/* Image Credit */}
        {featuredSource && (
          <View
            style={[
              styles.imageCreditOverlay,
              { backgroundColor: `${backgroundColor}F0` },
            ]}
          >
            <Image
              source={{
                uri:
                  featuredSource.favicon ||
                  `https://www.google.com/s2/favicons?sz=64&domain_url=${featuredSource.domain}`,
              }}
              style={styles.creditFavicon}
            />
            <Text
              style={[styles.creditText, { color: textColor }]}
              numberOfLines={1}
            >
              {featuredSource.domain}
            </Text>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.cardContent}>
        {/* Alert Tag */}
        <View style={[styles.alertTag, { backgroundColor: accentColor }]}>
          <Text style={[styles.alertTagText, { color: "#ffffff" }]}>
            {alertText}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={[styles.newsTitle, { color: textColor }]}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {alertReport.title}
        </Text>

        {/* Metadata Row */}
        <View style={styles.metadataContainer}>
          <View style={styles.timeContainer}>
            <ClockIcon width={14} height={14} color={placeholderGray} />
            <Text style={[styles.timeText, { color: placeholderGray }]}>
              {dayjs(alertReport.generated_at).fromNow()}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { color: placeholderGray }]}>
              {readingTime} min read
            </Text>
            <Text style={[styles.statsDivider, { color: placeholderGray }]}>
              •
            </Text>
            <Text style={[styles.statsText, { color: placeholderGray }]}>
              {alertReport.match_count} sources
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          {/* Source Icons */}
          <View style={styles.sourcesContainer}>
            <View style={styles.sourceIcons}>
              {sourceIcons.map((icon: any, index: number) => (
                <View key={icon.key} style={styles.sourceIconWrapper}>
                  <Image
                    source={{ uri: icon.favicon }}
                    style={[styles.sourceFavicon, { backgroundColor }]}
                  />
                </View>
              ))}
              {extraSourceCount > 0 && (
                <View
                  style={[
                    styles.extraSourceIcon,
                    { backgroundColor: borderColor },
                  ]}
                >
                  <Text style={[styles.extraSourceText, { color: textColor }]}>
                    +{extraSourceCount}
                  </Text>
                </View>
              )}
            </View>

            {sourceIcons.length > 0 && (
              <Text style={[styles.sourcesLabel, { color: placeholderGray }]}>
                Sources
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor }]}
              onPress={markAsRead}
              activeOpacity={0.7}
            >
              <TickIcon width={16} height={16} color={textColor} />
              <Text style={[styles.actionText, { color: textColor }]}>
                <FormattedMessage id="mark_as_read" />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    width: "100%",
    borderRadius: moderateScale(16),
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: verticalScale(16),
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: verticalScale(160),
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageCreditOverlay: {
    position: "absolute",
    bottom: moderateScale(8),
    right: moderateScale(8),
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(4),
  },
  creditFavicon: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginRight: horizontalScale(4),
  },
  creditText: {
    fontSize: moderateScale(10),
    fontFamily: "Inter-Medium",
  },
  cardContent: {
    padding: horizontalScale(16),
  },
  alertTag: {
    alignSelf: "flex-start",
    borderRadius: moderateScale(100),
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(12),
  },
  alertTagText: {
    fontSize: moderateScale(11),
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(12),
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
    marginLeft: horizontalScale(4),
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
  },
  statsDivider: {
    fontSize: moderateScale(13),
    marginHorizontal: horizontalScale(6),
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sourcesContainer: {
    flex: 1,
    marginRight: horizontalScale(12),
  },
  sourceIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  sourceIconWrapper: {
    marginRight: -horizontalScale(6),
  },
  sourceFavicon: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  extraSourceIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  extraSourceText: {
    fontSize: moderateScale(9),
    fontFamily: "Inter-SemiBold",
  },
  sourcesLabel: {
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    gap: horizontalScale(4),
  },
  actionText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    gap: horizontalScale(4),
  },
  primaryButtonText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
  },
});

export default AlertReportCard;
