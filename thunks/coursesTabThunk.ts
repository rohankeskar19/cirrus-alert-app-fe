import { createAsyncThunk } from "@reduxjs/toolkit";

import { setCourses, setLoading } from "@/slices/courses";
import { fetchCourses } from "@/utils/apiUtils";

export const fetchCoursesThunk = createAsyncThunk(
  "courses/fetchCourses",
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));

      const courses = await fetchCourses();

      if (courses) {
        dispatch(setCourses(courses));
      } else {
        dispatch(setCourses([])); // fallback to empty array
      }
    } catch (error) {
      console.error("fetchCoursesThunk error:", error);
      dispatch(setCourses([]));
    } finally {
      dispatch(setLoading(false));
    }
  },
);
