package com.anonymous.Daisy.modules


import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import com.anonymous.Daisy.models.AppUsageData
import com.anonymous.Daisy.models.DailyUsageData
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream
import java.util.*
import kotlin.collections.HashMap

class ScreenTimeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ScreenTimeModule"
    }

    @ReactMethod
    fun getScreenTimeData(promise: Promise) {
        try {
            val context = reactApplicationContext
            val usageStatsManager =
                context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val packageManager = context.packageManager


            val endTime = System.currentTimeMillis()
            val startTime = endTime - (7 * 24 * 60 * 60 * 1000L)

            val usageStats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            if (usageStats.isEmpty()) {
                promise.resolve(createEmptyResult())
                return
            }

            val dailyData = processDailyUsageStats(usageStats, packageManager, startTime)
            val result = createResultMap(dailyData, startTime, endTime)

            promise.resolve(result)
        } catch (error: Exception) {
            promise.reject(
                "SCREEN_TIME_ERROR",
                "Failed to get screen time data: ${error.message}",
                error
            )
        }
    }

    @ReactMethod
    fun getDetailedAppUsage(promise: Promise) {
        try {
            val context = reactApplicationContext
            val usageStatsManager =
                context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val packageManager = context.packageManager

            val endTime = System.currentTimeMillis()
            val startTime = endTime - (7 * 24 * 60 * 60 * 1000L)

            val usageStats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_BEST,
                startTime,
                endTime
            )

            val launcherIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            val launchablePackages = packageManager
                .queryIntentActivities(launcherIntent, 0)
                .map { it.activityInfo.packageName }
                .toSet()

            val myPackage = context.packageName
            val appUsageMap = mutableMapOf<String, AppUsageData>()

            for (usageStat in usageStats) {
                if (usageStat.totalTimeInForeground > 0 &&
                    usageStat.packageName != myPackage &&
                    launchablePackages.contains(usageStat.packageName)
                ) {
                    val appName = getAppName(packageManager, usageStat.packageName)
                    val appIcon = getAppIcon(packageManager, usageStat.packageName)
                    val existingData = appUsageMap[usageStat.packageName]

                    if (existingData != null) {
                        appUsageMap[usageStat.packageName] = existingData.copy(
                            totalTimeInForeground = existingData.totalTimeInForeground + usageStat.totalTimeInForeground,
                            lastTimeUsed = maxOf(existingData.lastTimeUsed, usageStat.lastTimeUsed),
                            firstTimeStamp = minOf(
                                existingData.firstTimeStamp,
                                usageStat.firstTimeStamp
                            )
                        )
                    } else {
                        appUsageMap[usageStat.packageName] = AppUsageData(
                            packageName = usageStat.packageName,
                            appName = appName,
                            appIcon = appIcon,
                            totalTimeInForeground = usageStat.totalTimeInForeground,
                            lastTimeUsed = usageStat.lastTimeUsed,
                            firstTimeStamp = usageStat.firstTimeStamp
                        )
                    }
                }
            }

            val sortedApps = appUsageMap.values
                .sortedByDescending { it.totalTimeInForeground }
                .take(5)

            val result = WritableNativeMap().apply {
                putString("startTime", startTime.toString())
                putString("endTime", endTime.toString())
                putArray("apps", WritableNativeArray().apply {
                    sortedApps.forEach { app ->
                        pushMap(WritableNativeMap().apply {
                            putString("packageName", app.packageName)
                            putString("appName", app.appName)
                            putString("appIcon", app.appIcon)
                            putDouble("totalTimeInForeground", app.totalTimeInForeground.toDouble())
                            putString("lastTimeUsed", app.lastTimeUsed.toString())
                            putString("firstTimeStamp", app.firstTimeStamp.toString())
                            putString("formattedTime", formatTime(app.totalTimeInForeground))
                        })
                    }
                })
                putDouble(
                    "totalScreenTime",
                    sortedApps.sumOf { it.totalTimeInForeground }.toDouble()
                )
                putString(
                    "formattedTotalTime",
                    formatTime(sortedApps.sumOf { it.totalTimeInForeground })
                )
            }

            promise.resolve(result)
        } catch (error: Exception) {
            promise.reject(
                "DETAILED_USAGE_ERROR",
                "Failed to get detailed app usage: ${error.message}",
                error
            )
        }
    }


    private fun processDailyUsageStats(
        usageStats: List<UsageStats>,
        packageManager: PackageManager,
        startTime: Long
    ): List<DailyUsageData> {
        val dailyMap = mutableMapOf<String, MutableMap<String, AppUsageData>>()
        val calendar = Calendar.getInstance()
        val endTime = System.currentTimeMillis()

        val validDates = mutableSetOf<String>()
        for (i in 0 until 7) {
            calendar.timeInMillis = startTime + (i * 24 * 60 * 60 * 1000L)
            val dateKey = "${calendar.get(Calendar.YEAR)}-${
                String.format("%02d", calendar.get(Calendar.MONTH) + 1)
            }-${String.format("%02d", calendar.get(Calendar.DAY_OF_MONTH))}"
            validDates.add(dateKey)
        }

        for (usageStat in usageStats) {
            if (usageStat.packageName != reactApplicationContext.packageName &&
                usageStat.totalTimeInForeground > 0) {

                // Only include usage if lastTimeUsed falls within our 7-day window
                if (usageStat.lastTimeUsed >= startTime && usageStat.lastTimeUsed <= endTime) {
                    calendar.timeInMillis = usageStat.lastTimeUsed
                    val dateKey = "${calendar.get(Calendar.YEAR)}-${
                        String.format("%02d", calendar.get(Calendar.MONTH) + 1)
                    }-${String.format("%02d", calendar.get(Calendar.DAY_OF_MONTH))}"

                    // Only process if the date is within our valid 7-day range
                    if (validDates.contains(dateKey)) {
                        if (!dailyMap.containsKey(dateKey)) {
                            dailyMap[dateKey] = mutableMapOf()
                        }

                        val dayMap = dailyMap[dateKey]!!
                        val appName = getAppName(packageManager, usageStat.packageName)
                        val appIcon = getAppIcon(packageManager, usageStat.packageName)

                        if (dayMap.containsKey(usageStat.packageName)) {
                            val existing = dayMap[usageStat.packageName]!!
                            dayMap[usageStat.packageName] = existing.copy(
                                totalTimeInForeground = existing.totalTimeInForeground + usageStat.totalTimeInForeground
                            )
                        } else {
                            dayMap[usageStat.packageName] = AppUsageData(
                                packageName = usageStat.packageName,
                                appName = appName,
                                appIcon = appIcon,
                                totalTimeInForeground = usageStat.totalTimeInForeground,
                                lastTimeUsed = usageStat.lastTimeUsed,
                                firstTimeStamp = usageStat.firstTimeStamp
                            )
                        }
                    }
                }
            }
        }

        return dailyMap.map { (date, apps) ->
            DailyUsageData(
                date = date,
                totalScreenTime = apps.values.sumOf { it.totalTimeInForeground },
                apps = apps.values.sortedByDescending { it.totalTimeInForeground }
            )
        }
    }

    private fun createResultMap(
        dailyData: List<DailyUsageData>,
        startTime: Long,
        endTime: Long
    ): WritableMap {
        return WritableNativeMap().apply {
            putString("startTime", startTime.toString())
            putString("endTime", endTime.toString())
            putArray("dailyData", WritableNativeArray().apply {
                dailyData.forEach { day ->
                    pushMap(WritableNativeMap().apply {
                        putString("date", day.date)
                        putDouble("totalScreenTime", day.totalScreenTime.toDouble())
                        putString("formattedTotalTime", formatTime(day.totalScreenTime))
                        putArray("apps", WritableNativeArray().apply {
                            day.apps.take(10).forEach { app -> // Top 10 apps per day
                                pushMap(WritableNativeMap().apply {
                                    putString("packageName", app.packageName)
                                    putString("appName", app.appName)
                                    putString("appIcon", app.appIcon)
                                    putDouble(
                                        "totalTimeInForeground",
                                        app.totalTimeInForeground.toDouble()
                                    )
                                    putString(
                                        "formattedTime",
                                        formatTime(app.totalTimeInForeground)
                                    )
                                })
                            }
                        })
                    })
                }
            })
            putDouble("totalScreenTime", dailyData.sumOf { it.totalScreenTime }.toDouble())
            putString("formattedTotalTime", formatTime(dailyData.sumOf { it.totalScreenTime }))
            putInt("daysCount", dailyData.size)
        }
    }

    private fun createEmptyResult(): WritableMap {
        return WritableNativeMap().apply {
            putString("startTime", "0")
            putString("endTime", "0")
            putArray("dailyData", WritableNativeArray())
            putDouble("totalScreenTime", 0.0)
            putString("formattedTotalTime", "0h 0m")
            putInt("daysCount", 0)
        }
    }

    private fun getAppIcon(packageManager: PackageManager, packageName: String): String? {
        return try {
            val drawable = packageManager.getApplicationIcon(packageName)
            drawableToBase64(drawable)
        } catch (e: PackageManager.NameNotFoundException) {
            null
        }
    }

    private fun drawableToBase64(drawable: Drawable): String? {
        return try {
            val bitmap = drawableToBitmap(drawable)
            val byteArrayOutputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 80, byteArrayOutputStream)
            val byteArray = byteArrayOutputStream.toByteArray()
            "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.DEFAULT)
        } catch (e: Exception) {
            null
        }
    }

    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        if (drawable is BitmapDrawable && drawable.bitmap != null) {
            return drawable.bitmap
        }

        val bitmap = if (drawable.intrinsicWidth <= 0 || drawable.intrinsicHeight <= 0) {
            Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)
        } else {
            Bitmap.createBitmap(
                drawable.intrinsicWidth,
                drawable.intrinsicHeight,
                Bitmap.Config.ARGB_8888
            )
        }

        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }

    @ReactMethod
    fun getAppIcon(packageName: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val packageManager = context.packageManager
            val icon = getAppIcon(packageManager, packageName)

            if (icon != null) {
                val result = WritableNativeMap().apply {
                    putString("packageName", packageName)
                    putString("appName", getAppName(packageManager, packageName))
                    putString("appIcon", icon)
                }
                promise.resolve(result)
            } else {
                promise.reject("ICON_NOT_FOUND", "Could not get icon for package: $packageName")
            }
        } catch (error: Exception) {
            promise.reject("ICON_ERROR", "Failed to get app icon: ${error.message}", error)
        }
    }

    @ReactMethod
    fun getMultipleAppIcons(packageNames: ReadableArray, promise: Promise) {
        try {
            val context = reactApplicationContext
            val packageManager = context.packageManager
            val result = WritableNativeArray()

            for (i in 0 until packageNames.size()) {
                val packageName = packageNames.getString(i)
                val icon = getAppIcon(packageManager, packageName.toString())
                val appName = getAppName(packageManager, packageName.toString())

                result.pushMap(WritableNativeMap().apply {
                    putString("packageName", packageName)
                    putString("appName", appName)
                    putString("appIcon", icon)
                })
            }

            promise.resolve(result)
        } catch (error: Exception) {
            promise.reject(
                "MULTIPLE_ICONS_ERROR",
                "Failed to get multiple app icons: ${error.message}",
                error
            )
        }
    }

    private fun getAppName(packageManager: PackageManager, packageName: String): String {
        return try {
            val applicationInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(applicationInfo).toString()
        } catch (e: PackageManager.NameNotFoundException) {
            packageName
        }
    }

    private fun formatTime(milliseconds: Long): String {
        val totalMinutes = milliseconds / (1000 * 60)
        val hours = totalMinutes / 60
        val minutes = totalMinutes % 60

        return when {
            hours > 0 -> "${hours}h ${minutes}m"
            minutes > 0 -> "${minutes}m"
            else -> "< 1m"
        }
    }
}