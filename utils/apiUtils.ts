import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { Alert } from "react-native";

import api from "@/lib/api";

// import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

export type UserProfile = {
  email: string;
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
      // first_name: userData.first_name,
      // age: userData.age,
      // interests: userData.interests,
      // learning_goal: userData.learning_goal,
      // learning_routine: userData.learning_routine,
      created_at: new Date().toISOString(),
    },
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  Alert.alert(
    "Account created succesfully",
    "Your account has been created!\nYou can now login to continue"
  );

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

/**
 * Update user profile information
 * @param prompt - Topic user wants to learn
 * @returns Boolean indicating success or failure
 */
export const generateTopic = async (prompt: string): Promise<string | null> => {
  try {
    const response = await api.post("/course/generate-topic", { prompt });

    return response.data.topic;
  } catch (error: any) {
    console.error(
      "Error generating topic:",
      error?.response?.data || error.message
    );
    Alert.alert("Please enter a valid topic");
    return null;
  }
};

/**
 * Update user profile information
 * @param prompt - Topic user wants to learn
 * @param currentKnowledge - Current knowledge of user about the topic
 * @param reason - Reason to learn the topic
 * @returns Boolean indicating success or failure
 */
export const generateCourse = async (
  prompt: string,
  knowledge: string,
  reason: string
) => {
  try {
    await api.post("/course/generate-course", {
      prompt,
      knowledge,
      reason,
    });
  } catch (error: any) {
    console.error(
      "Error generating topic:",
      error?.response?.data || error.message
    );
    Alert.alert("Please enter a valid topic");
    return null;
  }
};

/**
 * Fetches user's courses with current chapter and progress info
 */
export const fetchCourses = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("Not logged in");

    const userId = session.user.id;

    // Step 1: Get all user courses
    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (courseError) throw courseError;

    const enrichedCourses = [];

    // Step 2: For each course, find current/first chapter + progress
    for (const course of courses) {
      const { data: chapters, error: chapterError } = await supabase
        .from("chapters")
        .select("id, title, description, order_index")
        .eq("course_id", course.id)
        .order("order_index", { ascending: true });

      if (chapterError || !chapters) {
        console.warn("Failed to fetch chapters for course:", course.id);
        continue;
      }

      const { data: lessons, error: lessonError } = await supabase
        .from("lessons")
        .select("id, chapter_id, progress")
        .in(
          "chapter_id",
          chapters.map((ch) => ch.id)
        );

      if (lessonError || !lessons) {
        console.warn("Failed to fetch lessons for course:", course.id);
        continue;
      }

      // Determine course progress
      const totalLessons = lessons.length;
      const completedLessons = lessons.filter(
        (l) => l.progress?.completed === true
      ).length;
      const progressPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      // Find ongoing chapter
      const chapterProgressMap = new Map();

      for (const lesson of lessons) {
        const current = chapterProgressMap.get(lesson.chapter_id) || {
          total: 0,
          completed: 0,
        };
        current.total += 1;
        if (lesson.progress?.completed === true) {
          current.completed += 1;
        }
        chapterProgressMap.set(lesson.chapter_id, current);
      }

      // Sort by: in-progress > not-started > completed
      let ongoingChapter =
        chapters.find((ch) => {
          const prog = chapterProgressMap.get(ch.id);
          return prog && prog.completed < prog.total && prog.completed > 0;
        }) ||
        chapters.find((ch) => {
          const prog = chapterProgressMap.get(ch.id);
          return !prog || prog.completed === 0;
        }) ||
        chapters[0]; // fallback

      enrichedCourses.push({
        ...course,
        currentChapter: ongoingChapter,
        progress: progressPercentage,
      });
    }

    return enrichedCourses;
  } catch (error: any) {
    console.error("Error fetching enriched courses:", error.message);
    return null;
  }
};

/**
 * Fetches full course overview including chapters and lessons
 */
export const fetchCourseOverview = async (courseId: string) => {
  try {
    // Fetch course with chapters and lessons
    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select(
        `
        *,
        chapters (
          *,
          lessons (
            id,
            title,
            chapter_id,
            order_index,
            progress,
            content
          )
        )
      `
      )
      .eq("id", courseId)
      .order("created_at", { ascending: false });

    if (courseError) throw courseError;
    if (!courses || courses.length === 0) return null;

    const course = courses[0];
    const chapters = (course.chapters || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((chapter: any) => ({
        ...chapter,
        lessons: (chapter.lessons || []).sort(
          (a: any, b: any) => a.order_index - b.order_index
        ),
      }));

    // Flatten all lessons
    const allLessons = chapters.flatMap((ch: any) => ch.lessons || []);
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter(
      (lesson: any) => lesson.progress?.completed === true
    ).length;

    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // Determine the ongoing chapter
    const chapterProgressMap = new Map();

    for (const lesson of allLessons) {
      const current = chapterProgressMap.get(lesson.chapter_id) || {
        total: 0,
        completed: 0,
      };
      current.total += 1;
      if (lesson.progress?.completed) {
        current.completed += 1;
      }
      chapterProgressMap.set(lesson.chapter_id, current);
    }

    let ongoingChapter =
      chapters.find((ch: any) => {
        const prog = chapterProgressMap.get(ch.id);
        return prog && prog.completed < prog.total && prog.completed > 0;
      }) ||
      chapters.find((ch: any) => {
        const prog = chapterProgressMap.get(ch.id);
        return !prog || prog.completed === 0;
      }) ||
      chapters[0]; // fallback

    return {
      ...course,
      chapters,
      progress: progressPercentage,
      currentChapter: ongoingChapter,
    };
  } catch (error: any) {
    console.error("Error fetching course overview:", error.message);
    return null;
  }
};

/**
 * Mark a lesson as complete by its ID
 * @param lessonId - The ID of the lesson to mark as completed
 * @returns Boolean indicating success or failure
 */
export const markLessonAsComplete = async (lessonId: string) => {
  try {
    const { error } = await supabase
      .from("lessons")
      .update({
        progress: {
          completed: true,
        },
      })
      .eq("id", lessonId);

    if (error) {
      console.error("Error marking lesson as complete:", error.message);
      Alert.alert("Error", "Could not mark lesson as complete.");
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return false;
  }
};

/**
 * Get lessons for a given chapter by its ID
 * @param chapterId - The ID of the chapter
 * @returns Array of lessons sorted by order_index
 */
export const getLessonsForChapter = async (chapterId: string) => {
  try {
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("id, title, chapter_id, order_index, progress, content")
      .eq("chapter_id", chapterId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching lessons for chapter:", error.message);
      return null;
    }

    return lessons;
  } catch (error: any) {
    console.error("Unexpected error fetching lessons:", error.message);
    return null;
  }
};
