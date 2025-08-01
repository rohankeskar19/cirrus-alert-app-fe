// utils/lessonUtils.ts

import { Platform } from "react-native";

/**
 * Determines the position (center, left, right) of a lesson based on its index
 * in the pattern: 1 center, 2 left, 2 right, 2 left, 2 right, etc.
 *
 * @param index The index of the lesson in the list
 * @returns "center", "left", or "right"
 */
export const determineLessonPosition = (
  index: number
): "center" | "left" | "right" => {
  if (index === 0) {
    // First lesson is center
    return "center";
  }

  // Adjust index to start from 0 for lessons after the first
  const adjustedIndex = index - 1;

  // Calculate the group number (0-based)
  const groupNumber = Math.floor(adjustedIndex / 2);

  // Each group of 2 alternates between left and right
  return groupNumber % 2 === 0 ? "left" : "right";
};

/**
 * Determines if a connector should be a vertical or horizontal line
 * based on the lesson's position and surrounding lessons
 *
 * @param position The position of the lesson ("center", "left", "right")
 * @param index The index of the lesson in the list
 * @param totalCount Total number of lessons
 * @returns The connector type: "vertical", "horizontal", "none"
 */
export const determineConnectorType = (
  position: "center" | "left" | "right",
  index: number,
  totalCount: number
): "vertical" | "horizontal" | "none" => {
  if (index === totalCount - 1) {
    // Last lesson has no connector
    return "none";
  }

  if (position === "center") {
    // Center always has a vertical connector down
    return "vertical";
  }

  // For left and right positions, we need to know the next lesson's position
  const nextPosition = determineLessonPosition(index + 1);

  // If same side (left-left or right-right), use vertical connector
  if (position === nextPosition) {
    return "vertical";
  }

  // If switching sides (left-right or right-left), use horizontal connector
  return "horizontal";
};

/**
 * Groups lessons by chapter and returns lesson counts for each chapter
 * This is useful for displaying chapter transitions in the path
 *
 * @param lessons Array of all lessons
 * @returns Object mapping chapter IDs to lesson counts
 */
export const getLessonCountsByChapter = (
  lessons: Array<{ chapterId: number }>
): Record<number, number> => {
  return lessons.reduce((counts, lesson) => {
    const { chapterId } = lesson;
    counts[chapterId] = (counts[chapterId] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);
};

/**
 * Determines if a lesson is the first one in its chapter
 *
 * @param lessons Array of all lessons
 * @param index The index of the current lesson
 * @returns boolean indicating if this is the first lesson in a chapter
 */
export const isFirstLessonInChapter = (
  lessons: Array<{ chapterId: number }>,
  index: number
): boolean => {
  if (index === 0) return true;

  const currentLesson = lessons[index];
  const previousLesson = lessons[index - 1];

  return currentLesson.chapterId !== previousLesson.chapterId;
};

/**
 * Calculate starting positions for each chapter in the lesson list
 *
 * @param lessons Array of all lessons
 * @returns Object mapping chapter IDs to their starting index in the lesson array
 */
export const getChapterStartIndices = (
  lessons: Array<{ chapterId: number }>
): Record<number, number> => {
  const indices: Record<number, number> = {};

  lessons.forEach((lesson, index) => {
    const { chapterId } = lesson;
    if (indices[chapterId] === undefined) {
      indices[chapterId] = index;
    }
  });

  return indices;
};

export const getShadowColor = (hexColor: string): string => {
  const hex = hexColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const darkenFactor = 0.15;
  const darkerR = Math.max(0, Math.floor(r * (1 - darkenFactor)));
  const darkerG = Math.max(0, Math.floor(g * (1 - darkenFactor)));
  const darkerB = Math.max(0, Math.floor(b * (1 - darkenFactor)));

  return `#${darkerR.toString(16).padStart(2, "0")}${darkerG
    .toString(16)
    .padStart(2, "0")}${darkerB.toString(16).padStart(2, "0")}`;
};

export const formatMinutes = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

export const isIos = () => Platform.OS === "ios";
