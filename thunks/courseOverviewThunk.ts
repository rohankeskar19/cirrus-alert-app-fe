import { createAsyncThunk } from "@reduxjs/toolkit";

import { setCourseOverview, setLoading } from "@/slices/course-overview";
import { fetchCourseOverview } from "@/utils/apiUtils";

export const fetchCourseOverviewThunk = createAsyncThunk(
  "courses/fetchCourse",
  async (courseId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));

      const courseOverview = await fetchCourseOverview(courseId);

      if (courseOverview) {
        dispatch(setCourseOverview(courseOverview));
      } else {
        dispatch(setCourseOverview({}));
      }
    } catch (error) {
      console.error("fetchCoursesThunk error:", error);
      dispatch(setCourseOverview({}));
    } finally {
      dispatch(setLoading(false));
    }
  },
);
