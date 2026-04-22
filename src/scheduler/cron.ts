import cron from 'node-cron';
import { logger } from '../utils/logger';

export const scheduleDailyScrape = (task: () => Promise<void>) => {
  const schedule = process.env.CRON_SCHEDULE || '0 1 * * *';
  
  if (!cron.validate(schedule)) {
    logger.error(`[Scheduler] Invalid cron schedule: ${schedule}`);
    return;
  }

  cron.schedule(schedule, async () => {
    logger.info('[Scheduler] Triggering scheduled scrape run');
    try {
      await task();
    } catch (error) {
      logger.error('[Scheduler] Error during scheduled task:', error);
    }
  });
};
