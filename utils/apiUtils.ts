import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { Alert } from "react-native";

export type AlertType = "immediate" | "daily" | "weekly";
export type AlertVariant = "summary" | "links";

// import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

export type UserProfile = {
  email: string;
  onboarding_done: boolean;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
    .single();

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
    .single();

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
    Alert.alert("Password Reset Error", error.message);
    return false;
  }

  Alert.alert(
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
  alertType: AlertType,
  alertVariant: AlertVariant
): Promise<boolean> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Not logged in:", sessionError?.message);
      Alert.alert("Error", "You must be logged in to create an alert.");
      return false;
    }

    const userId = session.user.id;

    const { error: insertError } = await supabase.from("alerts").insert([
      {
        user_id: userId,
        alert_text: alertText,
        alert_sources: alertSources,
        alert_type: alertType,
        alert_variant: alertVariant,
      },
    ]);

    if (insertError) {
      console.error("Error creating alert:", insertError.message);
      Alert.alert("Failed to create alert", insertError.message);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Unexpected error creating alert:", error.message);
    Alert.alert("Something went wrong", error.message);
    return false;
  }
};
