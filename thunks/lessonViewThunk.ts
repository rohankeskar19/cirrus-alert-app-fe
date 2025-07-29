import { createAsyncThunk } from "@reduxjs/toolkit";

import { setLoading } from "@/slices/course-overview";
import { setLessonView } from "@/slices/lesson-view";
import { getLessonsForChapter, markLessonAsComplete } from "@/utils/apiUtils";

import { fetchCourseOverviewThunk } from "./courseOverviewThunk";

export const markLessonAsCompleteThunk = createAsyncThunk(
  "lessonView/markLessonAsComplete",
  async (
    { lessonId, courseId }: { lessonId: string; courseId: string },
    { dispatch },
  ) => {
    try {
      dispatch(setLoading(true));

      await markLessonAsComplete(lessonId);

      dispatch(setLoading(false));

      dispatch(fetchCourseOverviewThunk(courseId) as any);
    } catch (error) {
      console.error("fetchCoursesThunk error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

export const getLessonsForChapterThunk = createAsyncThunk(
  "lessonView/getLessonsForChapter",
  async ({ chapterId }: { chapterId: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setLessonView([]));
      const lessons = await getLessonsForChapter(chapterId);

      dispatch(setLoading(false));
      dispatch(setLessonView(lessons));
    } catch (error) {
      console.error("fetchCoursesThunk error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  },
);
