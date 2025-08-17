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
};

const AlertReportCard = ({ alertReport }: AlertReportCardProps) => {
  const router = useRouter();
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");

  const matches = alertReport.matches_data ?? ([] as any);
  const featuredImage =
    matches[0]?.images?.featured ?? "https://via.placeholder.com/120";

  const sourceIcons = matches.slice(0, 3).map((match: any, index: number) => ({
    key: `favicon-${index}`,
    favicon:
      match.favicon ||
      `https://www.google.com/s2/favicons?sz=64&domain_url=${match.domain}`,
  }));

  const extraSourceCount = matches.length > 3 ? matches.length - 3 : 0;
  const alertText = alertReport.alerts?.alert_text ?? "Alert";

  const markAsRead = async (event: any) => {
    event.stopPropagation(); // Prevent card navigation
    try {
      await markAlertReportAsRead(alertReport.id);
    } catch (err) {
      // throw error
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
      activeOpacity={0.8}
      onPress={handleCardPress}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: featuredImage }} style={styles.newsImage} />
        <View style={styles.newsTextContainer}>
          <Text
            style={[styles.newsTitle, { color: textColor }]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {alertReport.title}
          </Text>

          <View style={[styles.newsTag, { backgroundColor: accentColor }]}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.newsTagText, { color: "#ffffff" }]}
            >
              {alertText}
            </Text>
          </View>

          <View style={styles.timeContainer}>
            <ClockIcon width={17} height={17} color={placeholderGray} />
            <Text
              style={[styles.timeText, { color: placeholderGray }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {dayjs(alertReport.generated_at).fromNow()}
            </Text>
          </View>

          <View style={styles.newsFooter}>
            <View style={styles.newsIcons}>
              {sourceIcons.map((icon: any) => (
                <Image
                  key={icon.key}
                  source={{ uri: icon.favicon }}
                  style={[styles.sourceFavicon, { backgroundColor }]}
                />
              ))}
              {extraSourceCount > 0 && (
                <View
                  style={[styles.sourceIcon, { backgroundColor: textColor }]}
                >
                  <Text
                    style={[styles.sourceIconText, { color: backgroundColor }]}
                  >
                    +{extraSourceCount}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.markAsReadButton}>
              <TouchableOpacity
                style={styles.markAsReadTouchable}
                onPress={markAsRead}
              >
                <TickIcon color={textColor} />
                <Text
                  style={[styles.markAsReadText, { color: textColor }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  <FormattedMessage id="mark_as_read" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// (styles remain the same as in your original component)
const styles = StyleSheet.create({
  newsCard: {
    width: "100%",
    borderRadius: moderateScale(14),
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: "row",
    flex: 1,
  },
  newsImage: {
    width: horizontalScale(105),
    height: "100%",
    borderTopLeftRadius: moderateScale(14),
    borderBottomLeftRadius: moderateScale(14),
    marginRight: moderateScale(12),
  },
  newsTextContainer: {
    flex: 1,
    paddingRight: horizontalScale(14),
    paddingTop: verticalScale(13),
    paddingBottom: verticalScale(16),
    justifyContent: "space-between",
  },
  newsTitle: {
    fontSize: moderateScale(18),
    fontFamily: "SpaceGrotesk-SemiBold",
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(15),
  },
  newsTag: {
    borderRadius: moderateScale(100),
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(8),
    alignSelf: "flex-start",
    marginBottom: verticalScale(13),
    maxWidth: "100%",
  },
  newsTagText: {
    fontSize: moderateScale(13),
    fontFamily: "SpaceGrotesk-Medium",
  },
  newsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  timeText: {
    fontSize: moderateScale(15),
    fontFamily: "SpaceGrotesk-Medium",
    marginLeft: horizontalScale(8),
    flex: 1,
  },
  newsIcons: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sourceIcon: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(100),
    alignItems: "center",
    justifyContent: "center",
  },
  sourceIconText: {
    color: "white",
    fontSize: moderateScale(12),
    fontFamily: "SpaceGrotesk-Medium",
  },
  markAsReadButton: {
    flex: 1,
    alignItems: "flex-end",
  },
  markAsReadTouchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(11),
    padding: moderateScale(5),
  },
  markAsReadText: {
    fontSize: moderateScale(15),
    fontFamily: "SpaceGrotesk-SemiBold",
    maxWidth: horizontalScale(100),
  },
  sourceFavicon: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(100),
    marginRight: -moderateScale(10),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
});

export default AlertReportCard;
