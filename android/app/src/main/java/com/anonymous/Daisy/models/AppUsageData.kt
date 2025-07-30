package com.anonymous.Daisy.models

data class AppUsageData(
    val packageName: String,
    val appName: String,
    val appIcon: String?, // Base64 encoded icon
    val totalTimeInForeground: Long,
    val lastTimeUsed: Long,
    val firstTimeStamp: Long
)