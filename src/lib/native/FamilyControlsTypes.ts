export interface AppCategory {
  id: string;
  name: string;
  icon: string;
  apps: AppItem[];
  isSelected: boolean;
}

export interface AppItem {
  id: string;
  name: string;
  bundleId: string;
  isControlled: boolean;
  categoryId: string;
  icon?: string;
}

export interface AuthorizationStatus {
  isAuthorized: boolean;
  error?: string;
}

export interface SelectionResult {
  selectedApps: AppItem[];
  selectedCategories: AppCategory[];
}

export interface DeviceActivityData {
  startDate: string;
  endDate: string;
  totalUsageTime: number;
  appUsageTimes: {
    [bundleId: string]: number;
  };
}

export interface DelayConfig {
  duration: number; // In seconds
  showMotivationalQuotes: boolean;
  allowFlashcardBypass: boolean;
  maxDailyBypasses: number;
} 