// utils/lessonUtils.ts

import { Platform } from "react-native";

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
