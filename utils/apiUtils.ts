import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

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
 * Sign up a new user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns The new user object or null if signup failed
 */
export const signupUser = async (
  email: string,
  password: string
  // userData: UserProfile,
) => {
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
      created_at: new Date().toISOString(),
    },
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Return the user data
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
    .select("*, alerts(*)")
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
    .select("*, alerts(*)")
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
    .eq("user_id", session.user.id)
    .eq("is_active", true)
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
    .select("*, alerts(*)", { count: "exact" })
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

  const [totalResult, unreadResult, readResult] = await Promise.all([
    supabase
      .from("alert_reports")
      .select("*", { count: "exact", head: true })
      .eq("alerts.user_id", session.user.id),
    supabase
      .from("alert_reports")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("alerts.user_id", session.user.id),
    supabase
      .from("alert_reports")
      .select("*", { count: "exact", head: true })
      .eq("is_read", true)
      .eq("alerts.user_id", session.user.id),
  ]);

  return {
    total: totalResult.count || 0,
    unread: unreadResult.count || 0,
    read: readResult.count || 0,
  };
};
