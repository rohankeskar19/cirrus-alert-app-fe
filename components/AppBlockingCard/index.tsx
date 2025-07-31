import ClockIcon from "@/assets/icons/clock.svg";
import { AppUsageData } from "@/hooks/useScreenTime";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import CoinIcon from "@/assets/icons/coin.svg";
import { FormattedMessage } from "react-intl";

interface AppBlockingCardProps {
  app: AppUsageData;
  maxCost?: number;
}

const AppBlockingCard: React.FC<AppBlockingCardProps> = ({
  app,
  maxCost = 50,
}) => {
  const [appCost, setAppCost] = useState<number>(1);

  const handleSliderChange = (value: number) => {
    setAppCost(parseInt(value.toString()));
  };

  const onBackgroundColor = useThemeColor("onBackground");
  const questStatColor = useThemeColor("blockCardColor");
  const accentColor = useThemeColor("accentColor");
  const sliderTrack = useThemeColor("sliderTrack");

  return (
    <View
      style={[
        styles.appCard,
        {
          backgroundColor: questStatColor,
          borderColor: sliderTrack,
        },
      ]}
    >
      <View style={styles.appHeader}>
        <View style={styles.appInfo}>
          <View style={styles.appIconContainer}>
            <Image
              source={{ uri: app.appIcon }}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          <View style={styles.appDetails}>
            <Text style={[styles.appName, { color: onBackgroundColor }]}>
              {app.appName}
            </Text>
            <View style={styles.timeContainer}>
              <ClockIcon
                color={onBackgroundColor}
                width={moderateScale(17)}
                height={moderateScale(17)}
              />
              <Text style={[styles.timeText, { color: onBackgroundColor }]}>
                {app.formattedTime}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.costContainer}>
          <CoinIcon width={moderateScale(25)} height={moderateScale(25)} />
          <Text style={[styles.costText, { color: onBackgroundColor }]}>
            <FormattedMessage id="app_cost" values={{ cost: appCost }} />
          </Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          step={1}
          minimumValue={1}
          maximumValue={maxCost}
          value={appCost}
          onValueChange={(value: number) => handleSliderChange(value)}
          minimumTrackTintColor={accentColor}
          maximumTrackTintColor={onBackgroundColor}
          thumbTintColor={accentColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appCard: {
    width: "100%",
    height: verticalScale(124),
    borderRadius: moderateScale(21),
    padding: moderateScale(22),
    marginBottom: verticalScale(22),
    borderWidth: 2,
  },
  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appIconContainer: {
    width: moderateScale(43),
    height: moderateScale(43),
  },
  appIcon: {
    width: "100%",
    height: "100%",
  },
  iconText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  appDetails: {
    flex: 1,
    marginLeft: horizontalScale(18),
  },
  appName: {
    fontSize: moderateScale(18),
    fontFamily: "Outfit-Medium",
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
    position: "relative",
  },
  timeText: {
    fontSize: moderateScale(14),
    fontFamily: "Outfit-Regular",
    marginLeft: horizontalScale(6),
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  costText: {
    fontFamily: "Outfit-Medium",
    fontSize: moderateScale(18),
    marginLeft: horizontalScale(10),
  },
  sliderContainer: {
    width: "100%",
    marginTop: verticalScale(8),
  },
  slider: {
    width: "100%",
    height: 20,
  },
});

export default AppBlockingCard;
