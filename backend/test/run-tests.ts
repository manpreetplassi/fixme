import { runAnalyticsServiceTests } from './analytics.service.spec';
import { runDailyLogsServiceTests } from './daily-logs.service.spec';
import { runMoneyTrackerServiceTests } from './money-tracker.service.spec';

async function run(): Promise<void> {
  await runAnalyticsServiceTests();
  await runDailyLogsServiceTests();
  await runMoneyTrackerServiceTests();
}

void run();
