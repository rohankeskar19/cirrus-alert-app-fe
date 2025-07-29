import { createAsyncThunk } from "@reduxjs/toolkit";

import { setLoading, updateCourseData } from "@/slices/create-course";
import { generateCourse, generateTopic } from "@/utils/apiUtils";

export const generateTopicThunk = createAsyncThunk(
  "createCourse/generateTopic",
  async (prompt: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));

      const topic = await generateTopic(prompt);

      if (topic) {
        dispatch(updateCourseData({ short_topic: topic }));
      } else {
        dispatch(updateCourseData({ short_topic: "" }));
      }
    } catch (error) {
      console.error("generateTopicThunk error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

export const generateCourseThunk = createAsyncThunk(
  "createCourse/generateCourse",
  async (
    {
      prompt,
      knowledgeLevel,
      reason,
    }: { prompt: string; knowledgeLevel: string; reason: string },
    { dispatch },
  ) => {
    try {
      dispatch(setLoading(true));

      const topic = await generateCourse(prompt, knowledgeLevel, reason);

      if (topic) {
        dispatch(updateCourseData({ short_topic: topic }));
      } else {
        dispatch(updateCourseData({ short_topic: "" }));
      }
    } catch (error) {
      console.error("generateCourseThunk error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  },
);
