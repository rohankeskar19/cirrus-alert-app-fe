import { configureStore } from "@reduxjs/toolkit";

import { authSlice } from "../slices/auth";
import { onboardingSlice } from "../slices/onboarding";

export default configureStore({
  reducer: {
    auth: authSlice.reducer,
    onboarding: onboardingSlice.reducer,
  },
});
