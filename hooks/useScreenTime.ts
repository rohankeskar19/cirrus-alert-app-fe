import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus, NativeModules } from "react-native";

const { ScreenTimeModule } = NativeModules;

export interface AppUsageData {
  packageName: string;
  appName: string;
  appIcon?: string;
  totalTimeInForeground: number;
  formattedTime: string;
  lastTimeUsed?: string;
  firstTimeStamp?: string;
}

export interface DailyUsageData {
  date: string;
  totalScreenTime: number;
  formattedTotalTime: string;
  apps: AppUsageData[];
}

export interface ScreenTimeData {
  startTime: string;
  endTime: string;
  dailyData: DailyUsageData[];
  totalScreenTime: number;
  formattedTotalTime: string;
  daysCount: number;
}

export interface AppIconData {
  packageName: string;
  appName: string;
  appIcon?: string;
}

export interface DetailedAppUsage {
  startTime: string;
  endTime: string;
  apps: AppUsageData[];
  totalScreenTime: number;
  formattedTotalTime: string;
}

export const useScreenTime = () => {
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData | null>(
    null
  );
  const [detailedAppUsage, setDetailedAppUsage] =
    useState<DetailedAppUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScreenTimeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ScreenTimeModule.getScreenTimeData();
      console.log("Screen time data: ", data);
      setScreenTimeData(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch screen time data";
      console.error("Error fetching screen time data: ", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDetailedAppUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ScreenTimeModule.getDetailedAppUsage();
      console.log("Detailed app usage: ", data);
      setDetailedAppUsage(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch detailed app usage";
      console.error("Error fetching detailed app usage: ", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAppIcon = useCallback(
    async (packageName: string): Promise<AppIconData | null> => {
      try {
        const data = await ScreenTimeModule.getAppIcon(packageName);
        return data;
      } catch (err) {
        console.error("Error fetching app icon: ", err);
        return null;
      }
    },
    []
  );

  const getMultipleAppIcons = useCallback(
    async (packageNames: string[]): Promise<AppIconData[]> => {
      try {
        const data = await ScreenTimeModule.getMultipleAppIcons(packageNames);
        return data;
      } catch (err) {
        console.error("Error fetching multiple app icons: ", err);
        return [];
      }
    },
    []
  );

  const refreshData = useCallback(async () => {
    await Promise.all([fetchScreenTimeData(), fetchDetailedAppUsage()]);
  }, [fetchScreenTimeData, fetchDetailedAppUsage]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        refreshData();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [refreshData]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const getTopApps = useCallback(
    (limit: number = 10): AppUsageData[] => {
      if (!detailedAppUsage?.apps) return [];
      return detailedAppUsage.apps.slice(0, limit);
    },
    [detailedAppUsage]
  );

  const getDailyAverage = useCallback((): number => {
    if (!screenTimeData?.daysCount || screenTimeData.daysCount === 0) return 0;
    return screenTimeData.totalScreenTime / screenTimeData.daysCount;
  }, [screenTimeData]);

  const getUsageByDate = useCallback(
    (date: string): DailyUsageData | null => {
      if (!screenTimeData?.dailyData) return null;
      return screenTimeData.dailyData.find((day) => day.date === date) || null;
    },
    [screenTimeData]
  );

  const getTrendData = useCallback(() => {
    if (!screenTimeData?.dailyData) return [];
    return screenTimeData.dailyData.map((day) => ({
      date: day.date,
      totalTime: day.totalScreenTime,
      formattedTime: day.formattedTotalTime,
    }));
  }, [screenTimeData]);

  return {
    screenTimeData,
    detailedAppUsage,
    isLoading,
    error,
    fetchScreenTimeData,
    fetchDetailedAppUsage,
    refreshData,
    getAppIcon,
    getMultipleAppIcons,
    getTopApps,
    getDailyAverage,
    getUsageByDate,
    getTrendData,
  };
};

// Utility functions
export const formatScreenTime = (milliseconds: number): string => {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "< 1m";
  }
};

export const getScreenTimePercentage = (
  appTime: number,
  totalTime: number
): number => {
  if (totalTime === 0) return 0;
  return Math.round((appTime / totalTime) * 100);
};

export const isHighUsageApp = (timeInMs: number): boolean => {
  const hoursInMs = 60 * 60 * 1000;
  return timeInMs > hoursInMs; // More than 1 hour
};

export const getUsageLevel = (timeInMs: number): "low" | "medium" | "high" => {
  const minutesInMs = 60 * 1000;
  const hourInMs = 60 * minutesInMs;

  if (timeInMs < 30 * minutesInMs) return "low";
  if (timeInMs < hourInMs) return "medium";
  return "high";
};
