package com.anonymous.cirrus.models


data class DailyUsageData(
    val date: String,
    val totalScreenTime: Long,
    val apps: List<AppUsageData>
)
