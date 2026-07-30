import { runAnalyticsServiceTests } from './analytics.service.spec';
import { runMoneyTrackerServiceTests } from './money-tracker.service.spec';
import { runTodayServiceTests } from './today.service.spec';

async function run(): Promise<void> {
  await runAnalyticsServiceTests();
  await runTodayServiceTests();
  await runMoneyTrackerServiceTests();
}

void run();
