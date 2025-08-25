// app/(tabs)/settings.tsx - Main Settings Tab
import { ThemeContext } from "@/app/_layout";
import {
  deleteUserAccount,
  getCurrentUser,
  getUserSubscription,
  signOutUser,
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
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import CreditCardIcon from "@/assets/icons/credit-card.svg";
import DeleteAccountIcon from "@/assets/icons/delete-account-icon.svg";
import LockIcon from "@/assets/icons/lock.svg";
import MoonIcon from "@/assets/icons/moon.svg";
import SignoutIcon from "@/assets/icons/signout.svg";
import SliderIcon from "@/assets/icons/slider.svg";
import SunIcon from "@/assets/icons/sun.svg";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadUserData();
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

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const success = await signOutUser();
          if (success) {
            router.replace("/welcome");
          }
        },
      },
    ]);
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

  const renderThemeModal = () => (
    <Modal
      visible={showThemeModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={[styles.modalHeader]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Choose Theme
          </Text>
          <TouchableOpacity onPress={() => setShowThemeModal(false)}>
            <Text style={[styles.modalCloseText, { color: accentColor }]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.themeOptions}>
          {[
            {
              key: THEMES.LIGHT,
              label: "Light",
              icon: <SunIcon width={24} height={24} color={accentColor} />,
            },
            {
              key: THEMES.DARK,
              label: "Dark",
              icon: <MoonIcon width={24} height={24} color={accentColor} />,
            },
            {
              key: THEMES.AUTO,
              label: "Auto",
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
                  <Text style={[styles.checkmarkText, { color: "#ffffff" }]}>
                    ✓
                  </Text>
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
            Delete Account
          </Text>

          <Text style={[styles.deleteModalMessage, { color: placeholderGray }]}>
            This will permanently delete your account and all associated data
            including alerts, reports, and preferences. This action cannot be
            undone.
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
                Cancel
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
                  Delete Account
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: placeholderGray }]}>
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                Settings
              </Text>
              <Text style={[styles.headerSubtitle, { color: placeholderGray }]}>
                Manage your account and preferences
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderSettingsSection(
            "Account",
            <>
              {renderSettingsItem(
                <LockIcon width={20} height={20} color={secondaryGray} />,
                "Change Password",
                "Update your account password",
                () => router.push("/forgot-password")
              )}
            </>
          )}

          {renderSettingsSection(
            "Subscription",
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
            "Preferences",
            renderSettingsItem(
              <SliderIcon width={20} height={20} color={secondaryGray} />,
              "Theme",
              `Change app theme`,
              () => setShowThemeModal(true),
              getThemeIcon(theme)
            )
          )}

          {renderSettingsSection(
            "Danger Zone",
            <>
              {renderSettingsItem(
                <SignoutIcon width={20} height={20} color={redColor} />,
                "Sign Out",
                "Sign out of your account",
                handleLogout,
                undefined,
                true
              )}

              {renderSettingsItem(
                <DeleteAccountIcon width={20} height={20} color={redColor} />,
                "Delete Account",
                "Permanently delete your account and data",
                handleDeleteAccount,
                undefined,
                true
              )}
            </>
          )}

          <View style={styles.appInfo}>
            <Text style={[styles.appInfoText, { color: placeholderGray }]}>
              Cirrus v1.0.0
            </Text>
            <Text style={[styles.appInfoText, { color: placeholderGray }]}>
              Built with ❤️ for staying informed
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {renderThemeModal()}
      {renderDeleteModal()}
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
    flexGrow: 1,
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
    fontFamily: "Inter-SemiBold",
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
    paddingVertical: verticalScale(16),
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
    alignItems: "center",
    paddingVertical: verticalScale(24),
    marginTop: "auto",
    marginBottom: verticalScale(20),
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
});

export default SettingsTab;
