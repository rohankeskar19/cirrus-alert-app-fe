import { useCallback, useState } from "react";

import { useFocusEffect } from "expo-router";
import PermissionModule, {
  PermissionResponse,
} from "../modules/PermissionModule";

export const useUsageStatsPermission = () => {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermissionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await PermissionModule.getUsageStatsPermissionStatus();
      console.log("Usage stats permission status: ", status);
      setPermissionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await PermissionModule.requestUsageStatsPermission();
      setPermissionStatus(result);
      return result;
    } catch (err) {
      console.log("Error requesting permission: ", JSON.stringify(err));
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkPermissionStatus();
    }, [checkPermissionStatus])
  );

  return {
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    checkPermissionStatus,
  };
};
