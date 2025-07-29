import { useEffect, useState } from "react";

import ScreenTimeModule, {
  PermissionResponse,
} from "../modules/ScreenTimeModule";

export const useUsageStatsPermission = () => {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermissionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await ScreenTimeModule.getUsageStatsPermissionStatus();
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
      const result = await ScreenTimeModule.requestUsageStatsPermission();
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

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  return {
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    checkPermissionStatus,
  };
};
