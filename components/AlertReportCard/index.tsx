import { useThemeColor } from "@/hooks/useThemeColor";
import { AlertReport, markAlertReportAsRead } from "@/utils/apiUtils";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import ArrowTopRight from "@/assets/icons/arrow-top-right.svg";
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
            <ArrowTopRight />
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

        <Text
          style={[styles.alertTextTitle, { color: accentColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {alertText}
        </Text>

        <View style={styles.metadataRow}>
          <View style={styles.timeContainer}>
            <Text style={[styles.metadataText, { color: placeholderGray }]}>
              {dayjs(alertReport.generated_at).fromNow()}
            </Text>
          </View>

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
              <TickIcon width={14} height={14} color={textColor} />
              <Text style={[styles.markReadText, { color: textColor }]}>
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
    overflow: "hidden",
    marginBottom: verticalScale(12),
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
    borderRadius: moderateScale(4),
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
  cardContent: {
    paddingTop: verticalScale(11),
  },
  newsTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-SemiBold",
    lineHeight: moderateScale(26),
    marginBottom: verticalScale(8),
  },
  alertTextTitle: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
    lineHeight: moderateScale(26),
    marginBottom: verticalScale(11),
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(20),
    gap: horizontalScale(12),
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
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(100),
    borderWidth: 2,
  },
  extraSourceBadge: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(100),
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
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    gap: horizontalScale(13),
  },
  markReadText: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
    letterSpacing: 0.2,
  },
});

export default AlertReportCard;
