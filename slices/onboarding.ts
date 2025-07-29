import { createSlice } from "@reduxjs/toolkit";

export const onboardingSlice = createSlice({
  name: "onboarding",
  initialState: {
    userProfile: {},
  },
  reducers: {
    updateUserProfile: (state, action) => {
      state.userProfile = { ...state.userProfile, ...action.payload };
    },
  },
});

export const selectUserProfile = (state: any) => state.onboarding.userProfile;

export const { updateUserProfile } = onboardingSlice.actions;

export default onboardingSlice.reducer;
