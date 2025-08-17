import { useThemeColor } from "@/hooks/useThemeColor";
import { AlertReport, markAlertReportAsRead } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
  const featuredMatch = matches.find((m: any) => m.images?.featured) || null;

  const featuredImage =
    featuredMatch?.images?.featured ?? "https://via.placeholder.com/400x200";

  const featuredSource = featuredMatch || matches[0];

  const sourceIcons = matches.slice(0, 3).map((match: any, index: number) => ({
    key: `favicon-${index}`,
    favicon:
      match.favicon ||
      `https://www.google.com/s2/favicons?sz=64&domain_url=${match.domain}`,
    domain: match.domain,
  }));

  const extraSourceCount = matches.length > 3 ? matches.length - 3 : 0;
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
    <Pressable
      style={({ pressed }) => [
        styles.newsCard,
        {
          backgroundColor,
          borderColor,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={handleCardPress}
      android_ripple={{ color: placeholderGray + "20" }}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: featuredImage }} style={styles.featuredImage} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)"]}
          style={styles.imageGradient}
        />

        <View
          style={[styles.floatingAlertTag, { backgroundColor: accentColor }]}
        >
          <Text style={styles.floatingAlertText}>{alertText}</Text>
        </View>

        {featuredSource && (
          <View
            style={[
              styles.sourceCredit,
              { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
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
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text
          style={[styles.newsTitle, { color: textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {alertReport.title}
        </Text>

        <View style={styles.metadataRow}>
          <View style={styles.timeContainer}>
            <ClockIcon width={12} height={12} color={placeholderGray} />
            <Text style={[styles.metadataText, { color: placeholderGray }]}>
              {dayjs(alertReport.generated_at).fromNow()}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={[styles.metadataText, { color: placeholderGray }]}>
              <FormattedMessage id="read_time" values={{ time: readingTime }} />
            </Text>
            <Text style={[styles.statsDivider, { color: placeholderGray }]}>
              •
            </Text>
            <Text style={[styles.metadataText, { color: placeholderGray }]}>
              <FormattedMessage
                id="sources_count"
                values={{ count: alertReport.match_count }}
              />
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.sourcesContainer}>
            <View style={styles.sourceIconsRow}>
              {sourceIcons.map((icon: any, index: number) => (
                <View
                  key={icon.key}
                  style={[
                    styles.sourceIconWrapper,
                    { zIndex: sourceIcons.length + index, backgroundColor },
                  ]}
                >
                  <Image
                    source={{ uri: icon.favicon }}
                    style={[
                      styles.sourceFavicon,
                      { borderColor: backgroundColor },
                    ]}
                  />
                </View>
              ))}
              {extraSourceCount > 0 && (
                <View
                  style={[
                    styles.extraSourceBadge,
                    {
                      backgroundColor: borderColor,
                      borderColor: backgroundColor,
                      zIndex: 1000,
                    },
                  ]}
                >
                  <Text style={[styles.extraSourceText, { color: textColor }]}>
                    +{extraSourceCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {!alertReport.is_read && (
            <Pressable
              style={({ pressed }) => [
                styles.markReadButton,
                {
                  backgroundColor: pressed ? borderColor : "transparent",
                  borderColor: borderColor,
                },
              ]}
              onPress={markAsRead}
            >
              <TickIcon width={14} height={14} color={accentColor} />
              <Text style={[styles.markReadText, { color: accentColor }]}>
                <FormattedMessage id="mark_as_read" />
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    width: "100%",
    borderRadius: moderateScale(20),
    overflow: "hidden",
    marginBottom: verticalScale(12),
    borderWidth: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: verticalScale(180),
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  floatingAlertTag: {
    position: "absolute",
    top: moderateScale(16),
    left: moderateScale(16),
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
  },
  floatingAlertText: {
    fontSize: moderateScale(11),
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.8,
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
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    marginRight: horizontalScale(4),
  },
  sourceCreditText: {
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
    color: "#ffffff",
  },
  cardContent: {
    padding: moderateScale(20),
  },
  newsTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(26),
    marginBottom: verticalScale(16),
    letterSpacing: -0.2,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(6),
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  metadataText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
    opacity: 0.8,
  },
  statsDivider: {
    fontSize: moderateScale(12),
    opacity: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourcesContainer: {
    flex: 1,
  },
  sourceIconsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceIconWrapper: {
    marginRight: -horizontalScale(12),
    borderRadius: 100,
  },
  sourceFavicon: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    borderWidth: 2,
  },
  extraSourceBadge: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginLeft: horizontalScale(4),
  },
  extraSourceText: {
    fontSize: moderateScale(10),
    fontFamily: "Inter-Bold",
  },
  markReadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    gap: horizontalScale(6),
  },
  markReadText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-SemiBold",
    letterSpacing: 0.2,
  },
});

export default AlertReportCard;
