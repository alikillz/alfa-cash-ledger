export interface AppConfig {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;

  // App Settings
  appName: string;
  version: string;
  defaultTimezone: string;
  defaultCurrency: string;

  // Business Settings
  defaultLowBalanceThreshold: number;
  defaultSalaryDueDay: number;

  // Feature Flags
  enableOCR: boolean;
  enableOfflineMode: boolean;
  enableBackups: boolean;

  // Notification Settings
  salaryReminderDays: number[];
  lowBalanceAlertEnabled: boolean;

  // Backup Settings
  backupIntervalHours: number;
  fullBackupIntervalHours: number;
  backupRetentionDays: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  apiBaseUrl: 'https://api.alfa-app.com',
  apiTimeout: 30000,
  appName: 'ALFA Cash Ledger',
  version: '1.0.0',
  defaultTimezone: 'Asia/Karachi',
  defaultCurrency: 'PKR',
  defaultLowBalanceThreshold: 50000,
  defaultSalaryDueDay: 5,
  enableOCR: true,
  enableOfflineMode: true,
  enableBackups: true,
  salaryReminderDays: [7, 3, 1],
  lowBalanceAlertEnabled: true,
  backupIntervalHours: 1,
  fullBackupIntervalHours: 24,
  backupRetentionDays: 14,
};
