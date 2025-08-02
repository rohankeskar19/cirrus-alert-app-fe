import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Quest } from "@/types";

import CircleMinus from "@/assets/icons/circle-minus.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import CoinIcon from "@/assets/icons/coin.svg";
import EditPenIcon from "@/assets/icons/edit-pen.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import { QuestColorMap } from "@/constants/QuestColors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { formatMinutes } from "@/utils/uiUtils";
import { get } from "lodash";
import { FormattedMessage } from "react-intl";

interface QuestCardProps {
  isSelected: boolean;
  quest: Quest;
  onAddToggle: (quest: Quest) => void;
  onEdit: (quest: Quest) => void;
}

const OnboardingQuestCard = ({
  isSelected,
  quest,
  onAddToggle,
  onEdit,
}: QuestCardProps) => {
  const accentColor = get(QuestColorMap, `${quest.color}.accent`, quest.color);

  const redColor = useThemeColor("redColor");

  return (
    <View style={[styles.container, { backgroundColor: quest.color }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: accentColor }]}>
          {quest.title}
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={1}
          onPress={() => onEdit(quest)}
        >
          <EditPenIcon color={accentColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <View style={styles.coinsContainer}>
            <View style={styles.coinsBadge}>
              <CoinIcon width={25} height={25} />
              <Text style={styles.coinsText}>+{quest.coinsReward}</Text>
            </View>
          </View>
          {quest.isTimerBased && quest.targetDurationMinutes && (
            <View style={styles.durationContainer}>
              <ClockIcon color={accentColor} width={18} height={18} />
              <Text style={[styles.durationText, { color: accentColor }]}>
                {formatMinutes(quest.targetDurationMinutes)}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddToggle(quest)}
          activeOpacity={1}
        >
          {!isSelected ? (
            <PlusIcon
              style={styles.addIcon}
              color={"#000000"}
              width={15}
              height={15}
            />
          ) : (
            <CircleMinus
              style={styles.addIcon}
              color={redColor}
              width={15}
              height={15}
            />
          )}

          <Text
            style={[
              styles.btnText,
              { color: isSelected ? redColor : "#000000" },
            ]}
          >
            <FormattedMessage id={isSelected ? "remove" : "add"} />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: moderateScale(17),
    padding: moderateScale(16),
    marginBottom: verticalScale(26),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: moderateScale(20),
    fontFamily: "Outfit-SemiBold",
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  content: {
    justifyContent: "space-between",
    marginTop: verticalScale(56),
  },
  infoContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  coinsContainer: {},
  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE878",
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(100),
    alignSelf: "flex-start",
  },
  coinsIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  coinsText: {
    fontSize: moderateScale(16),
    fontFamily: "Outfit-Medium",
    color: "#BC9057",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: moderateScale(16),
    fontFamily: "Outfit-Medium",
    marginLeft: horizontalScale(6),
  },
  addButton: {
    width: "100%",
    height: verticalScale(42),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(14),
    marginTop: verticalScale(15),
  },
  addIcon: {
    marginRight: horizontalScale(12),
  },
  btnText: {
    fontSize: moderateScale(13),
    fontFamily: "Outfit-Medium",
  },
});

export default OnboardingQuestCard;
