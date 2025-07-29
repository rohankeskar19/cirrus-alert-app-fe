// lib/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";

const api = axios.create({
  baseURL:
    `${process.env.EXPO_PUBLIC_API_ENDPOINT}/api` ||
    "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const rawSession = await AsyncStorage.getItem(
    `sb-${process.env.EXPO_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`,
  );

  if (rawSession) {
    const parsed = JSON.parse(rawSession);
    const accessToken = parsed?.access_token;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

export default api;
