export type QuestType =
  | "ONE_TIME"
  | "REPEATABLE"
  | "DAILY"
  | "WEEKLY"
  | "COOLDOWN";
export type QuestStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "EXPIRED";
export type QuestVariant = "TIME_BASED" | "TASK";

export interface Quest {
  id: string;
  title: string;
  coinsReward: number;
  targetDurationMinutes: number | null;
  color: string;
  isTimerBased: boolean;
  questType: QuestType;
  maxCompletions: number | null;
  cooldownHours: number | null;
  status: QuestStatus;
  createdAt: string;
  isArchived: boolean;
  totalCompletions: number;
  totalTimeSpentMinutes: number;
  lastCompletedAt: string | null;
}
