import { NativeModules } from "react-native";

export interface PermissionResponse {
  status: "approved" | "denied" | "not_determined" | "unknown";
  message: string;
}

interface PermissionModuleInterface {
  requestScreenTimePermission(): Promise<PermissionResponse>;
  getScreenTimePermissionStatus(): Promise<PermissionResponse>;
  requestUsageStatsPermission(): Promise<PermissionResponse>;
  getUsageStatsPermissionStatus(): Promise<PermissionResponse>;
  requestOverlayPermission(): Promise<PermissionResponse>;
  getOverlayPermissionStatus(): Promise<PermissionResponse>;
  requestAccessibilityPermission(): Promise<PermissionResponse>;
  getAccessibilityPermissionStatus(): Promise<PermissionResponse>;
}

const { PermissionModule } = NativeModules;

export default PermissionModule as PermissionModuleInterface;
