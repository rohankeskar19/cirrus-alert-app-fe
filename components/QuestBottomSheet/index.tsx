import { Quest, QuestType, QuestVariant } from "@/types";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CoinIcon from "@/assets/icons/coin.svg";
import CrossIcon from "@/assets/icons/cross.svg";
import ScrollIcon from "@/assets/icons/scroll-icon.svg";

import ChevronDown from "@/assets/icons/chevron-down.svg";
import ColorFlask from "@/assets/icons/color-flask.svg";
import MinusIcon from "@/assets/icons/minus.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import QuestFrequency from "@/assets/icons/quest-frequency.svg";
import QuestTypeIcon from "@/assets/icons/quest-type.svg";
import RewardBox from "@/assets/icons/reward-box.svg";
import SwordCrossIcon from "@/assets/icons/sword-cross.svg";
import SwordIcon from "@/assets/icons/sword.svg";

import TaskTick from "@/assets/icons/task-tick.svg";
import TimerClock from "@/assets/icons/timer-based-clock.svg";

import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "../Button";

interface QuestBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onQuestCreated?: (quest: Quest) => void;
  onQuestUpdated?: (quest: Quest) => void;
  editingQuest?: Quest | null;
}

const QuestBottomSheet: React.FC<QuestBottomSheetProps> = ({
  visible,
  onDismiss,
  onQuestCreated,
  onQuestUpdated,
  editingQuest = null,
}) => {
  // State variables
  const [questName, setQuestName] = useState("");
  const [selectedQuestVariant, setSelectedQuestVariant] =
    useState<QuestVariant>("TIME_BASED");
  const [selectedQuestType, setSelectedQuestType] =
    useState<QuestType>("REPEATABLE");
  const [questTypeDropdownVisible, setQuestTypeDropdownVisible] =
    useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(30);
  const [rewardAmount, setRewardAmount] = useState<number | null>(30);
  const [maxCompletions, setMaxCompletions] = useState<number | null>(null);
  const [cooldownHours, setCooldownHours] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNameError, setShowNameError] = useState(false);

  // Changed from BottomSheet to BottomSheetModal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const questTypeModalRef = useRef<BottomSheetModal>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const intl = useIntl();

  const onBackgroundColor = useThemeColor("onBackground");
  const backgroundColor = useThemeColor("background");
  const inputBg = useThemeColor("inputBg");
  const inputBorder = useThemeColor("inputBorder");
  const redColor = useThemeColor("redColor");
  const inputPlaceholder = useThemeColor("placeholderGray");
  const accentColor = useThemeColor("accentColor");
  const dropdownBg = useThemeColor("dropdownBg");
  const dropdownBorder = useThemeColor("dropdownBorder");

  const isEditMode = editingQuest !== null;

  const questTypes: QuestType[] = [
    "ONE_TIME",
    "REPEATABLE",
    "DAILY",
    "WEEKLY",
    "COOLDOWN",
  ];

  const colors = [
    "#E0F7FA",
    "#F7E2FF",
    "#E8F5E9",
    "#FDE3E3",
    "#EDE7F6",
    "#FFF3E0",
    "#FFCFDF",
    "#FFF9C4",
  ];

  // Initialize form with editing quest data
  useEffect(() => {
    if (editingQuest) {
      setQuestName(editingQuest.title);
      setSelectedQuestVariant(
        editingQuest.isTimerBased ? "TIME_BASED" : "TASK"
      );
      setSelectedQuestType(editingQuest.questType);
      setRewardAmount(editingQuest.coinsReward);
      setMaxCompletions(editingQuest.maxCompletions);
      setCooldownHours(editingQuest.cooldownHours);

      // Find color index
      const colorIndex = colors.findIndex(
        (color) => color === editingQuest.color
      );
      setSelectedColorIndex(colorIndex >= 0 ? colorIndex : 0);

      // Set duration
      if (editingQuest.targetDurationMinutes) {
        const totalMinutes = editingQuest.targetDurationMinutes;
        setHours(Math.floor(totalMinutes / 60));
        setMinutes(totalMinutes % 60);
      }
    } else {
      // Reset form for creation
      resetForm();
    }

    if (visible) {
      bottomSheetModalRef?.current?.present();
    } else {
      bottomSheetModalRef?.current?.dismiss();
      resetForm();
    }
  }, [editingQuest, visible]);

  const resetForm = () => {
    setQuestName("");
    setSelectedQuestVariant("TIME_BASED");
    setSelectedQuestType("REPEATABLE");
    setSelectedColorIndex(0);
    setHours(1);
    setMinutes(30);
    setRewardAmount(30);
    setMaxCompletions(null);
    setCooldownHours(null);
    setErrorMessage(null);
    setShowNameError(false);
  };

  useEffect(() => {
    switch (selectedQuestType) {
      case "DAILY":
        setMaxCompletions(1);
        setCooldownHours(null);
        break;
      case "WEEKLY":
        setMaxCompletions(3);
        setCooldownHours(null);
        break;
      case "COOLDOWN":
        setMaxCompletions(null);
        setCooldownHours(6);
        break;
      default:
        setMaxCompletions(null);
        setCooldownHours(null);
    }
    setErrorMessage(null);
  }, [selectedQuestType]);

  useEffect(() => {
    if (showNameError && questName.trim() !== "") {
      setShowNameError(false);
      setErrorMessage(null);
    }
  }, [questName, showNameError]);

  const validateInputs = (): string | null => {
    if (questName.trim() === "") return "Quest name cannot be empty";
    if (questName.trim().length < 3)
      return "Quest name must be at least 3 characters";
    if (questName.trim().length > 50)
      return "Quest name must be less than 50 characters";
    return null;
  };

  const openQuestTypeDropdown = () => {
    questTypeModalRef.current?.present();
  };

  const formatDuration = (h: number, m: number): string => {
    return `${h}h ${m}m`;
  };

  const formatQuestType = (type: QuestType): string => {
    return type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ");
  };

  const increaseTime = () => {};

  const adjustTime = (increment: boolean) => {
    if (increment) {
      if (hours >= 12) return;
      if (minutes === 45) {
        setHours(hours + 1);
        setMinutes(0);
      } else {
        setMinutes(minutes < 15 ? minutes + 5 : minutes + 15);
      }
    } else {
      if (hours === 0 && minutes <= 5) return;
      if (minutes === 0) {
        if (hours > 0) {
          setHours(hours - 1);
          setMinutes(45);
        }
      } else {
        setMinutes(minutes <= 15 ? minutes - 5 : minutes - 15);
      }
    }
  };

  const adjustCounter = (
    value: number | null,
    setValue: (val: number | null) => void,
    increment: boolean,
    min: number = 1,
    max: number = 20,
    defaultValue: number = 1
  ) => {
    const currentValue = value ?? defaultValue;
    if (increment && currentValue < max) {
      setValue(currentValue + 1);
    } else if (!increment && currentValue > min) {
      setValue(currentValue - 1);
    }
  };

  const createOrUpdateQuest = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setErrorMessage(validationError);
      setShowNameError(questName.trim() === "");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setShowNameError(false);

    try {
      const targetDuration =
        selectedQuestVariant === "TIME_BASED" ? hours * 60 + minutes : null;

      const questData: Quest = {
        id: editingQuest?.id || Date.now().toString(),
        title: questName.trim(),
        coinsReward: rewardAmount || 0,
        targetDurationMinutes: targetDuration,
        color: colors[selectedColorIndex],
        isTimerBased: selectedQuestVariant === "TIME_BASED",
        questType: selectedQuestType,
        maxCompletions,
        cooldownHours,
        status: editingQuest?.status || "ACTIVE",
        createdAt: editingQuest?.createdAt || new Date().toISOString(),
        isArchived: editingQuest?.isArchived || false,
        totalCompletions: editingQuest?.totalCompletions || 0,
        totalTimeSpentMinutes: editingQuest?.totalTimeSpentMinutes || 0,
        lastCompletedAt: editingQuest?.lastCompletedAt || null,
      };

      if (isEditMode) {
        onQuestUpdated?.(questData);
      } else {
        onQuestCreated?.(questData);
      }

      onDismiss();
    } catch (error) {
      setErrorMessage(
        `Failed to ${isEditMode ? "update" : "create"} quest: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputLabel = (label: string, icon: any) => {
    const LabelIcon = icon;

    return (
      <View style={styles.inputLabelContainer}>
        <LabelIcon width={26} height={26} />
        <Text style={[styles.inputLabel, { color: onBackgroundColor }]}>
          {label}
        </Text>
      </View>
    );
  };

  const renderColorPicker = () => (
    <View style={styles.colorGrid}>
      {[0, 1].map((row) => (
        <View key={row} style={styles.colorRow}>
          {[0, 1, 2, 3].map((col) => {
            const index = row * 4 + col;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                style={[
                  styles.colorOption,
                  { backgroundColor: colors[index] },
                  {
                    borderColor:
                      selectedColorIndex == index ? accentColor : colors[index],
                  },
                ]}
                onPress={() => setSelectedColorIndex(index)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );

  const renderCounter = (
    value: number | null,
    setValue: (val: number | null) => void,
    icon: any,
    suffix: string,
    defaultValue: number = 1,
    min: number = 1,
    max: number = 20
  ) => (
    <View style={styles.counterContainer}>
      <TouchableOpacity
        style={[
          styles.counterButton,
          {
            backgroundColor: onBackgroundColor,
            marginRight: horizontalScale(40),
          },
        ]}
        activeOpacity={1}
        onPress={() =>
          adjustCounter(value, setValue, false, min, max, defaultValue)
        }
      >
        <MinusIcon color={backgroundColor} width={14} height={14} />
      </TouchableOpacity>
      {icon}
      <Text style={[styles.counterValue, { color: onBackgroundColor }]}>
        {`${value ?? defaultValue} ${suffix}`}
      </Text>

      <TouchableOpacity
        style={[
          styles.counterButton,
          {
            backgroundColor: onBackgroundColor,
            marginLeft: horizontalScale(40),
          },
        ]}
        activeOpacity={1}
        onPress={() =>
          adjustCounter(value, setValue, true, min, max, defaultValue)
        }
      >
        <PlusIcon color={backgroundColor} width={14} height={14} />
      </TouchableOpacity>
    </View>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onDismiss={onDismiss}
      enablePanDownToClose={true}
      snapPoints={["90%"]}
      enableDynamicSizing={false}
      style={{ backgroundColor: backgroundColor }}
      handleIndicatorStyle={{ backgroundColor: onBackgroundColor }}
      handleStyle={{
        backgroundColor: backgroundColor,
      }}
    >
      <View style={[styles.header, { backgroundColor: backgroundColor }]}>
        <View style={styles.headerContent}>
          <ScrollIcon width={35} height={35} />
          <Text style={[styles.headerTitle, { color: onBackgroundColor }]}>
            <FormattedMessage id={isEditMode ? "edit_quest" : "new_quest"} />
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeButton}
          activeOpacity={1}
        >
          <CrossIcon color={onBackgroundColor} width={30} height={30} />
        </TouchableOpacity>
      </View>
      <BottomSheetScrollView
        style={[styles.container, { backgroundColor: backgroundColor }]}
      >
        <View style={styles.section}>
          {renderInputLabel(
            intl.formatMessage({ id: "quest_title" }),
            SwordIcon
          )}
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: inputBg,
                borderColor: showNameError ? redColor : inputBorder,
                color: onBackgroundColor,
              },
            ]}
            value={questName}
            onChangeText={(text) => {
              if (text.length <= 50) setQuestName(text);
            }}
            placeholder={intl.formatMessage({ id: "quest_title_placeholder" })}
            selectionColor={accentColor}
            placeholderTextColor={inputPlaceholder}
            maxLength={50}
          />
          {errorMessage && (
            <Text style={[styles.errorText, { color: redColor }]}>
              {errorMessage}
            </Text>
          )}
        </View>
        <View style={styles.section}>
          {renderInputLabel(intl.formatMessage({ id: "color" }), ColorFlask)}
          {renderColorPicker()}
        </View>
        <View style={styles.section}>
          {renderInputLabel(intl.formatMessage({ id: "reward" }), RewardBox)}
          {renderCounter(
            rewardAmount,
            setRewardAmount,
            <CoinIcon width={35} height={35} />,
            "",
            1,
            1,
            300
          )}
        </View>
        <View style={styles.section}>
          {renderInputLabel("Quest Type", QuestTypeIcon)}
          <View style={[{ backgroundColor: inputBg }, styles.variantContainer]}>
            <TouchableOpacity
              style={[
                styles.variantOption,
                {
                  backgroundColor:
                    selectedQuestVariant === "TIME_BASED"
                      ? backgroundColor
                      : "transparent",
                },
              ]}
              onPress={() => setSelectedQuestVariant("TIME_BASED")}
              activeOpacity={1}
            >
              <TimerClock width={25} height={25} />

              <Text
                style={[
                  styles.variantText,
                  {
                    color:
                      selectedQuestVariant === "TIME_BASED"
                        ? onBackgroundColor
                        : inputPlaceholder,
                  },
                ]}
              >
                <FormattedMessage id="timer_based" />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.variantOption,
                {
                  backgroundColor:
                    selectedQuestVariant === "TASK"
                      ? backgroundColor
                      : "transparent",
                },
              ]}
              onPress={() => setSelectedQuestVariant("TASK")}
              activeOpacity={1}
            >
              <TaskTick width={25} height={25} />
              <Text
                style={[
                  styles.variantText,
                  {
                    color:
                      selectedQuestVariant === "TASK"
                        ? onBackgroundColor
                        : inputPlaceholder,
                  },
                ]}
              >
                <FormattedMessage id="task_based" />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {selectedQuestVariant === "TIME_BASED" && (
          <View
            style={[
              styles.counterContainer,
              { marginBottom: verticalScale(40) },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.counterButton,
                {
                  backgroundColor: onBackgroundColor,
                  marginRight: horizontalScale(40),
                },
              ]}
              activeOpacity={1}
              onPress={() => adjustTime(false)}
            >
              <MinusIcon color={backgroundColor} width={14} height={14} />
            </TouchableOpacity>
            <Text style={[styles.counterValue, { color: onBackgroundColor }]}>
              {`${hours}h ${minutes}m`}
            </Text>

            <TouchableOpacity
              style={[
                styles.counterButton,
                {
                  backgroundColor: onBackgroundColor,
                  marginLeft: horizontalScale(40),
                },
              ]}
              activeOpacity={1}
              onPress={() => adjustTime(true)}
            >
              <PlusIcon color={backgroundColor} width={14} height={14} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.section}>
          {renderInputLabel(
            intl.formatMessage({ id: "quest_frequency" }),
            QuestFrequency
          )}
          <TouchableOpacity
            style={[
              styles.dropdown,
              { backgroundColor: dropdownBg, borderColor: dropdownBorder },
            ]}
            onPress={openQuestTypeDropdown}
          >
            <Text style={[styles.dropdownText, { color: onBackgroundColor }]}>
              {formatQuestType(selectedQuestType)}
            </Text>
            <ChevronDown width={12} height={12} />
          </TouchableOpacity>

          <BottomSheetModal
            ref={questTypeModalRef}
            snapPoints={["35%"]}
            enablePanDownToClose
            handleStyle={{ backgroundColor }}
            handleIndicatorStyle={{ backgroundColor: onBackgroundColor }}
            backgroundStyle={{ backgroundColor }}
          >
            <BottomSheetScrollView>
              {questTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedQuestType(type);
                    questTypeModalRef.current?.dismiss();
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: onBackgroundColor },
                    ]}
                  >
                    {formatQuestType(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </BottomSheetScrollView>
          </BottomSheetModal>
        </View>
        {selectedQuestType === "DAILY" && (
          <View style={styles.section}>
            {renderInputLabel(
              intl.formatMessage({ id: "daily_completions" }),
              QuestFrequency
            )}
            {renderCounter(
              maxCompletions,
              setMaxCompletions,
              null,
              "per day",
              1,
              1,
              20
            )}
          </View>
        )}
        {selectedQuestType === "WEEKLY" && (
          <View style={styles.section}>
            {renderInputLabel(
              intl.formatMessage({ id: "weekly_completions" }),
              QuestFrequency
            )}
            {renderCounter(
              maxCompletions,
              setMaxCompletions,
              null,
              "per week",
              3,
              1,
              20
            )}
          </View>
        )}
        {selectedQuestType === "COOLDOWN" && (
          <View style={styles.section}>
            {renderInputLabel(
              intl.formatMessage({ id: "cooldown_period" }),
              QuestFrequency
            )}
            {renderCounter(
              cooldownHours,
              setCooldownHours,
              null,
              "h cooldown",
              6,
              1,
              168
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </BottomSheetScrollView>

      <View
        style={[styles.buttonContainer, { backgroundColor: backgroundColor }]}
      >
        <Button
          type="primary"
          loading={isLoading}
          onPress={createOrUpdateQuest}
          style={{ height: verticalScale(50) }}
        >
          <View style={styles.buttonCta}>
            <SwordCrossIcon width={28} height={28} />
            <Text style={[styles.createButtonText, { color: backgroundColor }]}>
              <FormattedMessage
                id={isEditMode ? "update_quest" : "create_quest"}
              />
            </Text>
          </View>
        </Button>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(14),
    paddingTop: verticalScale(28),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(16),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: moderateScale(23),
    fontFamily: "Outfit-Medium",
    marginLeft: horizontalScale(10),
  },
  closeButton: {
    padding: moderateScale(8),
    position: "absolute",
    right: horizontalScale(16),
  },
  inputLabelContainer: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  section: {
    marginBottom: verticalScale(32),
  },
  inputLabel: {
    fontSize: moderateScale(18),
    fontFamily: "Outfit-Medium",
    marginLeft: horizontalScale(9),
  },
  textInput: {
    borderRadius: moderateScale(16),
    borderWidth: 1,
    padding: moderateScale(16),
    fontSize: moderateScale(18),
    minHeight: verticalScale(56),
    fontFamily: "Outfit-Regular",
  },
  textInputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(4),
    marginLeft: horizontalScale(16),
    fontFamily: "Outfit-Regular",
  },
  colorGrid: {
    gap: moderateScale(16),
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  colorOption: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(100),
    borderWidth: moderateScale(3),
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButton: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  counterValue: {
    fontSize: moderateScale(24),
    fontFamily: "Outfit-SemiBold",
    textAlign: "center",
    marginLeft: horizontalScale(16),
  },
  variantContainer: {
    flexDirection: "row",
    borderRadius: moderateScale(16),
    padding: moderateScale(9),
  },
  variantOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(15),
    padding: 12,
    gap: horizontalScale(8),
  },
  variantText: {
    fontSize: moderateScale(16),
    fontFamily: "Outfit-Medium",
  },
  dropdown: {
    borderRadius: moderateScale(16),
    borderWidth: 1,
    padding: moderateScale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: verticalScale(56),
  },
  dropdownText: {
    fontSize: moderateScale(18),
    fontFamily: "Outfit-Regular",
  },
  dropdownMenu: {
    borderRadius: moderateScale(16),
    marginTop: verticalScale(12),
    overflow: "hidden",
  },
  dropdownItem: {
    padding: moderateScale(16),
  },
  dropdownItemText: {
    fontSize: moderateScale(16),
    fontFamily: "Outfit-Regular",
  },
  bottomSpacing: {
    height: 20,
  },
  buttonContainer: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(23),
  },
  createButtonText: {
    fontSize: moderateScale(15),
    fontFamily: "Outfit-Medium",
    marginLeft: horizontalScale(15),
  },
  buttonCta: { flexGrow: 1, flexDirection: "row", alignItems: "center" },
});

export default QuestBottomSheet;
