import { NativeModules } from "react-native";

export interface PermissionResponse {
  status: "approved" | "denied" | "not_determined" | "unknown";
  message: string;
}

interface ScreenTimeModuleInterface {
  requestScreenTimePermission(): Promise<PermissionResponse>;
  getScreenTimePermissionStatus(): Promise<PermissionResponse>;
  requestUsageStatsPermission(): Promise<PermissionResponse>;
  getUsageStatsPermissionStatus(): Promise<PermissionResponse>;
  requestOverlayPermission(): Promise<PermissionResponse>;
  getOverlayPermissionStatus(): Promise<PermissionResponse>;
  requestAccessibilityPermission(): Promise<PermissionResponse>;
  getAccessibilityPermissionStatus(): Promise<PermissionResponse>;
}

const { ScreenTimeModule } = NativeModules;

export default ScreenTimeModule as ScreenTimeModuleInterface;
