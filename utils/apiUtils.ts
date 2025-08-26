import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { Alert as UiAlert } from "react-native";

export type AlertType = "immediate" | "daily" | "weekly";

export type UserProfile = {
  email: string;
  onboarding_done: boolean;
};

export interface Alert {
  id: string;
  user_id: string;
  alert_text: string;
  alert_sources: string[];
  alert_type: AlertType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_processed_at?: string | null;
  similarity_threshold: number;
}

export interface AlertReport {
  id: string;
  alert_id: string;
  title: string;
  summary_content: Record<string, any> | null;
  match_count: number;
  is_read: boolean;
  matches_data: Record<string, any> | null;
  generated_at: string;
  processing_duration_ms: number | null;
  alerts?: Alert;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Get the currently logged in user
 * @returns The current user object or null if not logged in
 */
export const getCurrentUser = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error getting session:", sessionError.message);
    return null;
  }

  if (!session) {
    return null;
  }

  // Get the user's profile data from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile:", profileError.message);
  }

  // Return both authentication data and profile data
  return {
    ...session.user,
    profile: profile || null,
  };
};

/**
 * Sign up a new user with email, password, and device timezone
 * @param email - User's email
 * @param password - User's password
 * @returns The new user object or null if signup failed
 */
export const signupUser = async (
  email: string,
  password: string
): Promise<any> => {
  let timezone = "UTC";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch (e) {
    console.warn("Failed to detect timezone, defaulting to UTC:", e);
  }

  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  if (!user) {
    throw new Error("Error during user creation");
  }

  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: user.id,
      email: user.email,
      onboarding_done: false,
      timezone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return user;
};

/**
 * Log in an existing user
 * @param email - User's email
 * @param password - User's password
 * @returns The user object or null if login failed
 */
export const loginUser = async (email: string, password: string) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("Error ", error);

  if (error) {
    throw new Error(error.message);
  }

  if (!session) {
    throw new Error("Failed to login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile:", profileError.message);
  }

  return {
    ...session.user,
    profile: profile || null,
  };
};

/**
 * Send a password reset email to the specified email address
 * @param email - User's email
 * @returns Boolean indicating success or failure
 */
export const forgotPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "yourapp://reset-password",
  });

  if (error) {
    UiAlert.alert("Password Reset Error", error.message);
    return false;
  }

  UiAlert.alert(
    "Password Reset Email Sent",
    "Check your email for a password reset link"
  );
  return true;
};

/**
 * Sign out the current user
 * @returns Boolean indicating success or failure
 */
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error.message);
    return false;
  }

  return true;
};

/**
 * Update user profile information
 * @param userId - User ID
 * @param profileData - Updated profile data
 * @returns Boolean indicating success or failure
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
) => {
  const { error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile:", error.message);
    return false;
  }

  return true;
};

export const createAlert = async (
  alertText: string,
  alertSources: string[],
  alertType: AlertType
): Promise<boolean> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Not logged in:", sessionError?.message);
      UiAlert.alert("Error", "You must be logged in to create an alert.");
      return false;
    }

    const userId = session.user.id;

    const { error: insertError } = await supabase.from("alerts").insert([
      {
        user_id: userId,
        alert_text: alertText,
        alert_sources: alertSources,
        alert_type: alertType,
      },
    ]);

    if (insertError) {
      console.error("Error creating alert:", insertError.message);
      UiAlert.alert("Failed to create alert", insertError.message);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Unexpected error creating alert:", error.message);
    UiAlert.alert("Something went wrong", error.message);
    return false;
  }
};

export const fetchAllAlertReports = async (): Promise<AlertReport[]> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) return [];

  const { data, error } = await supabase
    .from("alert_reports")
    .select("*, alerts!inner(*)")
    .eq("alerts.user_id", session.user.id)
    .order("generated_at", { ascending: false });

  if (error) {
    console.error("Error fetching alert reports:", error.message);
    return [];
  }

  return data as AlertReport[];
};

export const fetchUnreadAlertReports = async (): Promise<AlertReport[]> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) return [];

  const { data, error } = await supabase
    .from("alert_reports")
    .select("*, alerts!inner(*)")
    .eq("is_read", false)
    .eq("alerts.user_id", session.user.id)
    .order("generated_at", { ascending: false });

  if (error) {
    console.error("Error fetching unread alert reports:", error.message);
    return [];
  }

  return data as AlertReport[];
};

export const markAlertReportAsRead = async (
  reportId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("alert_reports")
    .update({ is_read: true })
    .eq("id", reportId);

  if (error) {
    console.error("Error marking alert report as read:", error.message);
    return false;
  }

  return true;
};

export const fetchActiveAlerts = async (): Promise<Alert[]> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) return [];

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("is_active", true)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active alerts:", error.message);
    return [];
  }

  return data as Alert[];
};

/**
 * Fetch all alert reports with optional filtering and search
 * @param searchQuery - Search query for report titles
 * @param alertId - Filter by specific alert ID
 * @param isRead - Filter by read status (true, false, or null for all)
 * @param limit - Number of reports to fetch
 * @param offset - Offset for pagination
 * @returns Filtered alert reports
 */
export const fetchFilteredAlertReports = async (
  searchQuery?: string,
  alertId?: string,
  isRead?: boolean | null,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: AlertReport[]; count: number }> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) return { data: [], count: 0 };

  let query = supabase
    .from("alert_reports")
    .select("*, alerts!inner(*)", { count: "exact" })
    .eq("alerts.user_id", session.user.id)
    .order("generated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    query = query.ilike("title", `%${searchQuery.trim()}%`);
  }

  // Apply alert filter
  if (alertId) {
    query = query.eq("alert_id", alertId);
  }

  // Apply read status filter
  if (isRead !== null && isRead !== undefined) {
    query = query.eq("is_read", isRead);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching filtered alert reports:", error.message);
    return { data: [], count: 0 };
  }

  return { data: (data as AlertReport[]) || [], count: count || 0 };
};

/**
 * Mark multiple alert reports as read
 * @param reportIds - Array of report IDs to mark as read
 * @returns Boolean indicating success
 */
export const markMultipleReportsAsRead = async (
  reportIds: string[]
): Promise<boolean> => {
  if (reportIds.length === 0) return true;

  const { error } = await supabase
    .from("alert_reports")
    .update({ is_read: true })
    .in("id", reportIds);

  if (error) {
    console.error("Error marking multiple reports as read:", error.message);
    return false;
  }

  return true;
};

/**
 * Get reports count by status
 * @returns Object with counts for different statuses
 */
export const getReportsStats = async (): Promise<{
  total: number;
  unread: number;
  read: number;
}> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) return { total: 0, unread: 0, read: 0 };

  const userId = session.user.id;

  const [totalResult, unreadResult, readResult] = await Promise.all([
    supabase
      .from("alert_reports")
      .select("id, alerts!inner(id)", { count: "exact", head: true })
      .eq("alerts.user_id", userId),
    supabase
      .from("alert_reports")
      .select("id, alerts!inner(id)", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("alerts.user_id", userId),
    supabase
      .from("alert_reports")
      .select("id, alerts!inner(id)", { count: "exact", head: true })
      .eq("is_read", true)
      .eq("alerts.user_id", userId),
  ]);

  return {
    total: totalResult?.count || 0,
    unread: unreadResult?.count || 0,
    read: readResult?.count || 0,
  };
};

/**
 * Toggle alert active status
 * @param alertId - Alert ID to toggle
 * @param isActive - New active status
 * @returns Boolean indicating success
 */
export const toggleAlertStatus = async (
  alertId: string,
  isActive: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from("alerts")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", alertId);

  if (error) {
    console.error("Error toggling alert status:", error.message);
    return false;
  }

  return true;
};

/**
 * Delete an alert
 * @param alertId - Alert ID to delete
 * @returns Boolean indicating success
 */
export const deleteAlert = async (alertId: string): Promise<boolean> => {
  const { error } = await supabase.from("alerts").delete().eq("id", alertId);

  if (error) {
    console.error("Error deleting alert:", error.message);
    return false;
  }

  return true;
};

/**
 * Update an existing alert
 * @param alertId - Alert ID to update
 * @param alertData - Updated alert data
 * @returns Boolean indicating success
 */
export const updateAlert = async (
  alertId: string,
  alertData: {
    alert_text?: string;
    alert_sources?: string[];
    alert_type?: AlertType;
    similarity_threshold?: number;
  }
): Promise<boolean> => {
  const { error } = await supabase
    .from("alerts")
    .update({
      ...alertData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", alertId);

  if (error) {
    console.error("Error updating alert:", error.message);
    return false;
  }

  return true;
};

/**
 * Get all alerts for the current user (both active and inactive)
 * @returns Array of all user alerts
 */
export const fetchAllUserAlerts = async (filters?: {
  status?: "all" | "active" | "inactive";
  alertFrequency?: AlertType[];
  sources?: string[];
  searchQuery?: string;
}): Promise<Alert[]> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) return [];

  let query = supabase
    .from("alerts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (filters?.status === "active") {
    query = query.eq("is_active", true);
  } else if (filters?.status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (filters?.alertFrequency && filters.alertFrequency.length > 0) {
    query = query.in("alert_type", filters.alertFrequency);
  }

  if (filters?.sources && filters.sources.length > 0) {
    query = query.overlaps("alert_sources", filters.sources);
  }

  if (filters?.searchQuery && filters.searchQuery.trim() !== "") {
    query = query.ilike("alert_text", `%${filters.searchQuery.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching alerts:", error.message);
    return [];
  }

  return data as Alert[];
};

/**
 * Delete user account and all associated data
 * @returns Boolean indicating success
 */
export const deleteUserAccount = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Not logged in:", sessionError?.message);
      return false;
    }

    // Delete user data (this should be handled by database triggers/policies)
    const { error: deleteError } = await supabase.rpc("delete_user_account", {
      user_id: session.user.id,
    });

    if (deleteError) {
      console.error("Error deleting user data:", deleteError.message);
      return false;
    }

    // Sign out the user
    await signOutUser();
    return true;
  } catch (error: any) {
    console.error("Unexpected error deleting account:", error.message);
    return false;
  }
};

/**
 * Get user subscription information
 * @returns User subscription data
 */
export const getUserSubscription = async (): Promise<{
  plan: string;
  status: string;
  expires_at?: string;
  features: string[];
} | null> => {
  try {
    return null;
    // const {
    //   data: { session },
    //   error: sessionError,
    // } = await supabase.auth.getSession();

    // if (sessionError || !session) return null;

    // const { data, error } = await supabase
    //   .from("user_subscriptions")
    //   .select("*")
    //   .eq("user_id", session.user.id)
    //   .maybeSingle();

    // if (error) {
    //   console.error("Error fetching subscription:", error.message);
    //   return null;
    // }

    // return (
    //   data || {
    //     plan: "free",
    //     status: "active",
    //     features: ["5 alerts", "Basic sources", "Email notifications"],
    //   }
    // );
  } catch (error) {
    console.error("Error getting subscription:", error);
    return null;
  }
};

export const updateUserTimezone = async (
  userId: string,
  timezone: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating timezone:", error.message);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Unexpected error updating timezone:", error.message);
    return false;
  }
};

/**
 * Check current notification permission and registration status
 * @returns Object with permission and registration status
 */
export const checkNotificationPermission = async (): Promise<{
  hasPermission: boolean;
  isRegistered: boolean;
  loading: boolean;
}> => {
  try {
    // Check if we have notification permission
    const { status } = await Notifications.getPermissionsAsync();
    const hasPermission = status === "granted";

    if (!hasPermission) {
      return { hasPermission: false, isRegistered: false, loading: false };
    }

    // Check if device is registered in our database
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { hasPermission, isRegistered: false, loading: false };
    }

    // Get device token to check registration
    let deviceToken = null;
    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      deviceToken = tokenData?.data;
    } catch (error) {
      console.error("Error getting device token:", error);
      return { hasPermission, isRegistered: false, loading: false };
    }

    if (!deviceToken) {
      return { hasPermission, isRegistered: false, loading: false };
    }

    // Check if this device token is registered in our database
    const { data, error } = await supabase
      .from("user_devices")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("push_token", deviceToken)
      .maybeSingle();

    if (error) {
      console.error("Error checking device registration:", error.message);
      return { hasPermission, isRegistered: false, loading: false };
    }

    return {
      hasPermission,
      isRegistered: !!data,
      loading: false,
    };
  } catch (error: any) {
    console.error("Error checking notification status:", error.message);
    return { hasPermission: false, isRegistered: false, loading: false };
  }
};

/**
 * Request notification permissions and register device
 * @param userId - User ID
 * @returns Boolean indicating success
 */
export const requestDeviceRegistration = async (
  userId: string
): Promise<boolean> => {
  try {
    console.log("Starting device registration...");

    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    console.log("Notification permission status:", status);

    if (status !== "granted") {
      console.log("Notification permission not granted");
      return false;
    }

    // Get device token
    const deviceToken = await Notifications.getDevicePushTokenAsync();

    if (!deviceToken?.data) {
      console.error("No device token received");
      return false;
    }

    const platform = Platform.OS === "ios" ? "ios" : "android";

    console.log("Got device token:", deviceToken.data, "Platform:", platform);

    // Register device in database
    const success = await registerDevice(userId, deviceToken.data, platform);

    if (success) {
      console.log("Device registered successfully");
      return true;
    } else {
      console.log("Failed to register device");
      return false;
    }
  } catch (error: any) {
    console.error("Error in device registration:", error.message);
    return false;
  }
};

/**
 * Update the existing registerDevice function to use proper error handling
 */
export const registerDevice = async (
  userId: string,
  token: string,
  type: string
): Promise<boolean> => {
  try {
    const devicePlatform = type === "ios" ? "ios" : "android";

    const { error } = await supabase.from("user_devices").upsert(
      {
        user_id: userId,
        device_platform: devicePlatform,
        push_token: token,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,push_token",
      }
    );

    if (error) {
      console.error("Error saving user device:", error.message);
      return false;
    }

    console.log("Device registered successfully");
    return true;
  } catch (err: any) {
    console.error("Failed to register device:", err.message);
    return false;
  }
};
