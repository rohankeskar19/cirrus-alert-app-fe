package com.anonymous.Daisy.modules

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.accessibility.AccessibilityManager

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap

class PermissionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context = reactContext

    override fun getName(): String {
        return "PermissionModule"
    }

    // Usage Stats Permission Methods
    @ReactMethod
    fun getUsageStatsPermissionStatus(promise: Promise) {
        try {
            val appOpsManager = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOpsManager.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                context.packageName
            )

            val status = when (mode) {
                AppOpsManager.MODE_ALLOWED -> "approved"
                AppOpsManager.MODE_IGNORED -> "denied"
                else -> "not_determined"
            }

            val response = WritableNativeMap().apply {
                putString("status", status)
                putString("message", "Usage stats permission status: $status")
            }

            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to check usage stats permission: ${e.message}")
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)

            val response = WritableNativeMap().apply {
                putString("status", "not_determined")
                putString("message", "Usage stats permission request initiated")
            }

            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to request usage stats permission: ${e.message}")
        }
    }

    // Overlay Permission Methods
    @ReactMethod
    fun getOverlayPermissionStatus(promise: Promise) {
        try {
            val canDrawOverlays = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(context)
            } else {
                true // Permission not required for older versions
            }

            val status = if (canDrawOverlays) "approved" else "denied"

            val response = WritableNativeMap().apply {
                putString("status", status)
                putString("message", "Overlay permission status: $status")
            }

            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to check overlay permission: ${e.message}")
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")
                )
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
            }

            val response = WritableNativeMap().apply {
                putString("status", "not_determined")
                putString("message", "Overlay permission request initiated")
            }

            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to request overlay permission: ${e.message}")
        }
    }

    // Accessibility Permission Methods
    @ReactMethod
    fun getAccessibilityPermissionStatus(promise: Promise) {
        try {
            val accessibilityManager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
            val isEnabled = accessibilityManager.isEnabled

            // Check if our specific accessibility service is enabled
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )

            val isOurServiceEnabled = enabledServices?.contains(context.packageName) == true

            val status = if (isEnabled && isOurServiceEnabled) "approved" else "denied"

            val response = WritableNativeMap().apply {
                putString("status", status)
                putString("message", "Accessibility permission status: $status")
            }

            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to check accessibility permission: ${e.message}")
        }
    }

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)

            val response = WritableNativeMap().apply {
                putString("status", "not_determined")
                putString("message", "Accessibility permission request initiated")
            }

            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to request accessibility permission: ${e.message}")
        }
    }

    // Screen Time Permission Methods (iOS compatibility)
    @ReactMethod
    fun getScreenTimePermissionStatus(promise: Promise) {
        // On Android, screen time is handled through usage stats
        getUsageStatsPermissionStatus(promise)
    }

    @ReactMethod
    fun requestScreenTimePermission(promise: Promise) {
        // On Android, screen time is handled through usage stats
        requestUsageStatsPermission(promise)
    }
}