import { ThemeContext } from "@/app/_layout";
import {
  checkNotificationPermission,
  deleteUserAccount,
  getCurrentUser,
  getUserSubscription,
  requestDeviceRegistration,
  signOutUser,
  updateUserTimezone,
} from "@/utils/apiUtils";
import { THEMES } from "@/utils/constants";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AutoIcon from "@/assets/icons/auto.svg";
import BellIcon from "@/assets/icons/bell.svg";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import CreditCardIcon from "@/assets/icons/credit-card.svg";
import DeleteAccountIcon from "@/assets/icons/delete-account-icon.svg";
import LockIcon from "@/assets/icons/lock.svg";
import MoonIcon from "@/assets/icons/moon.svg";
import SignoutIcon from "@/assets/icons/signout.svg";
import SliderIcon from "@/assets/icons/slider.svg";
import SunIcon from "@/assets/icons/sun.svg";
import Tick from "@/assets/icons/tick.svg";

import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { useRouter } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";

// Common timezones for easy selection
const COMMON_TIMEZONES = [
  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
  { label: "Mountain Time (MT)", value: "America/Denver" },
  { label: "Central Time (CT)", value: "America/Chicago" },
  { label: "Eastern Time (ET)", value: "America/New_York" },
  { label: "UTC", value: "UTC" },
  { label: "London", value: "Europe/London" },
  { label: "Paris/Berlin", value: "Europe/Paris" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
  { label: "Mumbai", value: "Asia/Kolkata" },
];

const SettingsTab = () => {
  const router = useRouter();
  const { theme, setTheme } = useContext(ThemeContext) as any;
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");
  const secondaryGray = useThemeColor("secondaryGray");
  const redColor = useThemeColor("redColor");
  const greenColor = useThemeColor("greenColor");

  const intl = useIntl();

  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<{
    hasPermission: boolean;
    isRegistered: boolean;
    loading: boolean;
  }>({ hasPermission: false, isRegistered: false, loading: false });

  useEffect(() => {
    loadUserData();
    checkNotificationStatus();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userData, subscriptionData] = await Promise.all([
        getCurrentUser(),
        getUserSubscription(),
      ]);

      setUser(userData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationStatus = async () => {
    try {
      const status = await checkNotificationPermission();
      setNotificationStatus(status);
    } catch (error) {
      console.error("Error checking notification status:", error);
    }
  };

  const handleTimezoneUpdate = async (timezone: string) => {
    try {
      const success = await updateUserTimezone(user?.id, timezone);
      if (success) {
        setUser({ ...user, profile: { ...user.profile, timezone } });
        setShowTimezoneModal(false);
        Alert.alert("Success", "Timezone updated successfully");
      } else {
        Alert.alert("Error", "Failed to update timezone");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update timezone");
    }
  };

  const handleNotificationSetup = async () => {
    if (!notificationStatus.hasPermission || !notificationStatus.isRegistered) {
      setNotificationStatus((prev) => ({ ...prev, loading: true }));

      try {
        const result = await requestDeviceRegistration(user?.id);
        if (result) {
          setNotificationStatus({
            hasPermission: true,
            isRegistered: true,
            loading: false,
          });
          Alert.alert("Success", "Notifications enabled successfully!");
        } else {
          setNotificationStatus((prev) => ({ ...prev, loading: false }));
          Alert.alert("Error", "Failed to enable notifications");
        }
      } catch (error) {
        setNotificationStatus((prev) => ({ ...prev, loading: false }));
        Alert.alert("Error", "Failed to enable notifications");
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      intl.formatMessage({ id: "sign_out" }),
      intl.formatMessage({ id: "logout_confirmation" }),
      [
        { text: intl.formatMessage({ id: "cancel" }), style: "cancel" },
        {
          text: intl.formatMessage({ id: "sign_out" }),
          style: "destructive",
          onPress: async () => {
            const success = await signOutUser();
            if (success) {
              router.replace("/welcome");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      const success = await deleteUserAccount();

      if (success) {
        setShowDeleteModal(false);
        router.replace("/welcome");
      } else {
        Alert.alert("Error", "Failed to delete account. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCurrentTimezoneLabel = () => {
    const userTimezone = user?.profile?.timezone;
    if (!userTimezone) return "Not set";

    const found = COMMON_TIMEZONES.find((tz) => tz.value === userTimezone);
    return found ? found.label : userTimezone;
  };

  const getNotificationStatusText = () => {
    if (notificationStatus.hasPermission && notificationStatus.isRegistered) {
      return "Enabled";
    } else if (
      notificationStatus.hasPermission &&
      !notificationStatus.isRegistered
    ) {
      return "Permission granted, needs registration";
    } else {
      return "Disabled";
    }
  };

  const getNotificationStatusColor = () => {
    if (notificationStatus.hasPermission && notificationStatus.isRegistered) {
      return greenColor;
    } else {
      return redColor;
    }
  };

  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case THEMES.LIGHT:
        return <SunIcon width={20} height={20} color={accentColor} />;
      case THEMES.DARK:
        return <MoonIcon width={20} height={20} color={accentColor} />;
      case THEMES.AUTO:
        return <AutoIcon width={20} height={20} color={accentColor} />;
      default:
        return <SunIcon width={20} height={20} color={accentColor} />;
    }
  };

  const getSubscriptionBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "canceled":
        return "#F59E0B";
      case "expired":
        return "#EF4444";
      default:
        return placeholderGray;
    }
  };

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: placeholderGray }]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor, borderColor }]}>
        {children}
      </View>
    </View>
  );

  const renderSettingsItem = (
    icon: any,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={1}
    >
      <View style={styles.settingsItemLeft}>
        {icon && <View style={[styles.settingsItemIcon]}>{icon}</View>}
        <View style={styles.settingsItemText}>
          <Text
            style={[
              styles.settingsItemTitle,
              { color: danger ? redColor : textColor },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.settingsItemSubtitle, { color: placeholderGray }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.settingsItemRight}>
        {rightComponent}
        {onPress && !danger && (
          <ChevronRightIcon width={16} height={16} color={placeholderGray} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTimezoneModal = () => (
    <Modal
      visible={showTimezoneModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Select Timezone
          </Text>
          <TouchableOpacity onPress={() => setShowTimezoneModal(false)}>
            <Text style={[styles.modalCloseText, { color: accentColor }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.timezoneOptions}>
          {COMMON_TIMEZONES.map((timezone) => (
            <TouchableOpacity
              key={timezone.value}
              style={[
                styles.timezoneOption,
                {
                  backgroundColor:
                    user?.profile?.timezone === timezone.value
                      ? `${accentColor}20`
                      : backgroundColor,
                  borderColor:
                    user?.profile?.timezone === timezone.value
                      ? accentColor
                      : borderColor,
                },
              ]}
              onPress={() => handleTimezoneUpdate(timezone.value)}
            >
              <Text style={[styles.timezoneOptionText, { color: textColor }]}>
                {timezone.label}
              </Text>
              {user?.profile?.timezone === timezone.value && (
                <View
                  style={[styles.checkmark, { backgroundColor: accentColor }]}
                >
                  <Tick width={16} height={16} color={"#ffffff"} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderThemeModal = () => (
    <Modal
      visible={showThemeModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={[styles.modalHeader]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            <FormattedMessage id="choose_theme" />
          </Text>
          <TouchableOpacity onPress={() => setShowThemeModal(false)}>
            <Text style={[styles.modalCloseText, { color: accentColor }]}>
              <FormattedMessage id="done" />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.themeOptions}>
          {[
            {
              key: THEMES.LIGHT,
              label: intl.formatMessage({ id: "light" }),
              icon: <SunIcon width={24} height={24} color={accentColor} />,
            },
            {
              key: THEMES.DARK,
              label: intl.formatMessage({ id: "dark" }),
              icon: <MoonIcon width={24} height={24} color={accentColor} />,
            },
            {
              key: THEMES.AUTO,
              label: intl.formatMessage({ id: "auto" }),
              icon: <AutoIcon width={24} height={24} color={accentColor} />,
            },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.themeOption,
                {
                  backgroundColor:
                    theme === option.key ? `${accentColor}20` : backgroundColor,
                  borderColor: theme === option.key ? accentColor : borderColor,
                },
              ]}
              onPress={() => {
                setTheme(option.key);
                setShowThemeModal(false);
              }}
            >
              <View style={styles.themeOptionLeft}>
                <View style={[styles.themeOptionIcon]}>{option.icon}</View>
                <Text style={[styles.themeOptionText, { color: textColor }]}>
                  {option.label}
                </Text>
              </View>

              {theme === option.key && (
                <View
                  style={[styles.checkmark, { backgroundColor: accentColor }]}
                >
                  <Tick width={16} height={16} color={"#ffffff"} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal visible={showDeleteModal} animationType="fade" transparent={true}>
      <View style={styles.deleteModalOverlay}>
        <View style={[styles.deleteModalContent, { backgroundColor }]}>
          <View
            style={[
              styles.deleteModalIcon,
              { backgroundColor: "rgba(239, 68, 68, 0.1)" },
            ]}
          >
            <DeleteAccountIcon width={32} height={32} color={redColor} />
          </View>

          <Text style={[styles.deleteModalTitle, { color: textColor }]}>
            <FormattedMessage id="delete_account" />
          </Text>

          <Text style={[styles.deleteModalMessage, { color: placeholderGray }]}>
            <FormattedMessage id="delete_account_warning" />
          </Text>

          <View style={styles.deleteModalButtons}>
            <TouchableOpacity
              style={[
                styles.deleteModalButton,
                styles.cancelButton,
                { borderColor },
              ]}
              onPress={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
              activeOpacity={1}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                <FormattedMessage id="cancel" />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteModalButton,
                styles.deleteButton,
                { backgroundColor: redColor },
              ]}
              onPress={confirmDeleteAccount}
              disabled={deleteLoading}
              activeOpacity={1}
            >
              {deleteLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={[styles.deleteButtonText, { color: "#ffffff" }]}>
                  <FormattedMessage id="delete_account" />
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                <FormattedMessage id="settings" />
              </Text>
              <Text style={[styles.headerSubtitle, { color: placeholderGray }]}>
                <FormattedMessage id="manage_your_account" />
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderSettingsSection(
            intl.formatMessage({ id: "account" }),
            <>
              {renderSettingsItem(
                <LockIcon width={20} height={20} color={secondaryGray} />,
                intl.formatMessage({ id: "change_password" }),
                intl.formatMessage({ id: "change_password_subtitle" }),
                () => router.push("/forgot-password")
              )}
              {renderSettingsItem(
                <ClockIcon width={20} height={20} color={secondaryGray} />,
                intl.formatMessage({ id: "timezone" }),
                getCurrentTimezoneLabel(),
                () => setShowTimezoneModal(true)
              )}
            </>
          )}

          {renderSettingsSection(
            intl.formatMessage({ id: "notifications" }),
            renderSettingsItem(
              <BellIcon width={20} height={20} color={secondaryGray} />,
              intl.formatMessage({ id: "push_notifications" }),
              getNotificationStatusText(),
              notificationStatus.hasPermission &&
                notificationStatus.isRegistered
                ? undefined
                : handleNotificationSetup,
              notificationStatus.loading ? (
                <ActivityIndicator size="small" color={accentColor} />
              ) : (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getNotificationStatusColor() },
                  ]}
                />
              )
            )
          )}

          {renderSettingsSection(
            intl.formatMessage({ id: "subscription" }),
            renderSettingsItem(
              <CreditCardIcon width={20} height={20} color={secondaryGray} />,
              subscription?.plan === "free"
                ? "Upgrade to Pro"
                : "Manage Subscription",
              subscription?.plan === "free"
                ? "Unlock unlimited alerts and premium features"
                : `${subscription?.plan} plan • ${subscription?.status}`,
              () => {
                Alert.alert(
                  "Subscription",
                  "Subscription management coming soon!"
                );
              },
              subscription?.plan !== "free" && (
                <View
                  style={[
                    styles.subscriptionBadge,
                    {
                      backgroundColor: getSubscriptionBadgeColor(
                        subscription?.status
                      ),
                    },
                  ]}
                >
                  <Text
                    style={[styles.subscriptionBadgeText, { color: "#ffffff" }]}
                  >
                    {subscription?.status?.toUpperCase()}
                  </Text>
                </View>
              )
            )
          )}

          {renderSettingsSection(
            intl.formatMessage({ id: "preferences" }),
            renderSettingsItem(
              <SliderIcon width={20} height={20} color={secondaryGray} />,
              intl.formatMessage({ id: "theme" }),
              `Change app theme`,
              () => setShowThemeModal(true),
              getThemeIcon(theme)
            )
          )}

          {renderSettingsSection(
            intl.formatMessage({ id: "danger_zone" }),
            <>
              {renderSettingsItem(
                <SignoutIcon width={20} height={20} color={redColor} />,
                intl.formatMessage({ id: "sign_out" }),
                intl.formatMessage({ id: "sign_out_account" }),
                handleLogout,
                undefined,
                true
              )}

              {renderSettingsItem(
                <DeleteAccountIcon width={20} height={20} color={redColor} />,
                intl.formatMessage({ id: "delete_account" }),
                intl.formatMessage({ id: "delete_account_subtitle" }),
                handleDeleteAccount,
                undefined,
                true
              )}
            </>
          )}

          <View style={styles.appInfo}>
            <Text style={[styles.appInfoText, { color: placeholderGray }]}>
              <FormattedMessage id="app_version" />
            </Text>
            <Text style={[styles.appInfoText, { color: placeholderGray }]}>
              <FormattedMessage id="built_with_love" />
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {renderThemeModal()}
      {renderDeleteModal()}
      {renderTimezoneModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  safeArea: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(5),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(12),
  },
  headerTitle: {
    fontSize: moderateScale(38),
    fontFamily: "Inter-Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    lineHeight: moderateScale(20),
    marginTop: verticalScale(12),
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  section: {
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
  },
  sectionContent: {
    borderRadius: moderateScale(5),
    overflow: "hidden",
    gap: verticalScale(24),
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsItemIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(12),
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
    lineHeight: moderateScale(20),
  },
  settingsItemSubtitle: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(16),
    marginTop: verticalScale(2),
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  subscriptionBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  subscriptionBadgeText: {
    fontSize: moderateScale(10),
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(28),
    fontFamily: "Inter-SemiBold",
    letterSpacing: -0.3,
  },
  modalCloseText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  themeOptions: {
    padding: horizontalScale(16),
    gap: verticalScale(12),
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(5),
    borderWidth: 1,
  },
  themeOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeOptionIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    marginRight: horizontalScale(12),
  },
  themeOptionText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  checkmark: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Bold",
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(32),
  },
  deleteModalContent: {
    borderRadius: moderateScale(5),
    padding: horizontalScale(24),
    alignItems: "center",
    width: "100%",
    maxWidth: horizontalScale(320),
  },
  deleteModalIcon: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(16),
  },
  deleteModalTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Inter-Bold",
    marginBottom: verticalScale(8),
  },
  deleteModalMessage: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(18),
    textAlign: "center",
    marginBottom: verticalScale(24),
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: horizontalScale(12),
    width: "100%",
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(5),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  deleteButtonText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
  },
  appInfo: {
    height: verticalScale(130),
    alignItems: "center",
    paddingVertical: verticalScale(24),
    marginTop: "auto",
  },
  appInfoText: {
    fontSize: moderateScale(12),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(16),
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(32),
  },
  iconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: verticalScale(24),
  },
  description: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(20),
    textAlign: "center",
    marginBottom: verticalScale(32),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(8),
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(12),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    paddingVertical: verticalScale(12),
  },
  eyeButton: {
    padding: moderateScale(8),
  },
  changePasswordButton: {
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(32),
  },
  changePasswordButtonText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-SemiBold",
  },
  headerSpacer: {
    width: moderateScale(40),
  },
  timezoneOptions: {
    padding: horizontalScale(16),
  },
  timezoneOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    marginBottom: verticalScale(8),
  },
  timezoneOptionText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
});

export default SettingsTab;
