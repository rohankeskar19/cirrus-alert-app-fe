import { useCallback, useEffect, useState } from "react";

import { useFocusEffect } from "expo-router";
import { AppState, AppStateStatus } from "react-native";
import PermissionModule, {
  PermissionResponse,
} from "../modules/PermissionModule";

export const useOverlayPermission = () => {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermissionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await PermissionModule.getOverlayPermissionStatus();
      setPermissionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await PermissionModule.requestOverlayPermission();
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
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkPermissionStatus();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [checkPermissionStatus]);

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
