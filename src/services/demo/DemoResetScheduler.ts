import { demoResetService, DemoResetService, DemoResetResult } from './DemoResetService';

export interface DemoResetSchedulerConfig {
  enabled?: boolean;
  scheduleTime?: string; // "HH:mm" (e.g. "02:00")
  timezone?: string;
}

export interface DemoResetSchedulerStatus {
  enabled: boolean;
  scheduleTime: string;
  timezone: string;
  active: boolean;
  nextScheduledRunAt: string | null;
  lastExecutedAt: string | null;
  lastResult: DemoResetResult | null;
}

export class DemoResetScheduler {
  private static instance: DemoResetScheduler;
  private timer: NodeJS.Timeout | null = null;
  private service: DemoResetService;
  private nextRunDate: Date | null = null;
  private lastExecutedAt: Date | null = null;
  private lastResult: DemoResetResult | null = null;

  constructor(service?: DemoResetService) {
    this.service = service || demoResetService;
  }

  public static getInstance(): DemoResetScheduler {
    if (!DemoResetScheduler.instance) {
      DemoResetScheduler.instance = new DemoResetScheduler();
    }
    return DemoResetScheduler.instance;
  }

  /**
   * Checks whether the automatic nightly scheduler is enabled.
   */
  public isEnabled(): boolean {
    const envVal = process.env.DEMO_RESET_SCHEDULE_ENABLED;
    if (envVal !== undefined) {
      return envVal.toLowerCase() === 'true' || envVal === '1';
    }
    // Default enabled for demonstration/demo environments
    return true;
  }

  /**
   * Returns the configured daily execution time (HH:mm, 24h format).
   * Defaults to 02:00 (2:00 AM).
   */
  public getScheduleTime(): { hour: number; minute: number; raw: string } {
    const raw = process.env.DEMO_RESET_SCHEDULE_TIME || '02:00';
    const match = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hour = Math.min(23, Math.max(0, parseInt(match[1], 10)));
      const minute = Math.min(59, Math.max(0, parseInt(match[2], 10)));
      const formatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      return { hour, minute, raw: formatted };
    }
    return { hour: 2, minute: 0, raw: '02:00' };
  }

  /**
   * Returns configured timezone or defaults to UTC / local system timezone.
   */
  public getTimezone(): string {
    return process.env.DEMO_RESET_SCHEDULE_TIMEZONE || 'UTC';
  }

  /**
   * Calculates the exact next date and millisecond delay until the specified target time.
   * If now is 01:30 and target is 02:00, it targets 02:00 today (30 mins).
   * If now is 02:15 and target is 02:00, it targets 02:00 tomorrow (~23h 45 mins).
   */
  public calculateNextRun(nowDate: Date = new Date()): { nextRunDate: Date; delayMs: number } {
    const { hour, minute } = this.getScheduleTime();
    const nextRun = new Date(nowDate.getTime());

    nextRun.setHours(hour, minute, 0, 0);

    // If the target time for today has already passed, schedule for tomorrow
    if (nextRun.getTime() <= nowDate.getTime()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const delayMs = Math.max(1000, nextRun.getTime() - nowDate.getTime());
    return { nextRunDate: nextRun, delayMs };
  }

  /**
   * Triggers an immediate reset run (manually, via API, or by the scheduler timer).
   */
  public async triggerReset(triggeredBy: string = 'In-Process Scheduler (02:00)'): Promise<DemoResetResult> {
    console.log(`[DemoResetScheduler] Triggering demo data reset (Triggered by: ${triggeredBy})...`);
    this.lastExecutedAt = new Date();
    try {
      const result = await this.service.executeDemoReset({
        triggeredBy,
      });
      this.lastResult = result;
      return result;
    } catch (err: any) {
      console.error('[DemoResetScheduler] Execution failed:', err.message || err);
      throw err;
    }
  }

  /**
   * Starts the background scheduler timer if enabled.
   */
  public startScheduler(): boolean {
    if (!this.isEnabled()) {
      console.log('[DemoResetScheduler] Nightly demo reset scheduler is DISABLED by configuration.');
      return false;
    }

    if (this.timer) {
      console.log('[DemoResetScheduler] Scheduler is already active.');
      return true;
    }

    const { raw } = this.getScheduleTime();
    const { nextRunDate, delayMs } = this.calculateNextRun();
    this.nextRunDate = nextRunDate;

    console.log(
      `[DemoResetScheduler] Nightly demo reset scheduler STARTED. Next run scheduled for: ${nextRunDate.toISOString()} (${raw} daily, in ~${Math.round(delayMs / 1000 / 60)} minutes)`
    );

    // Schedule single shot to exact 02:00, then reschedule on execution
    this.timer = setTimeout(async () => {
      try {
        await this.triggerReset(`Nightly Cron (${raw})`);
      } catch (e) {
        console.error('[DemoResetScheduler] Scheduled reset encountered an error:', e);
      } finally {
        this.timer = null;
        // Continue scheduling the next occurrence
        this.startScheduler();
      }
    }, delayMs);

    // Prevent this timer from blocking Node process exit in CLI / test environments
    if (this.timer.unref) {
      this.timer.unref();
    }

    return true;
  }

  /**
   * Stops the background scheduler timer.
   */
  public stopScheduler(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.nextRunDate = null;
      console.log('[DemoResetScheduler] Nightly demo reset scheduler STOPPED.');
    }
  }

  /**
   * Returns current diagnostics and operational status of the scheduler.
   */
  public getStatus(): DemoResetSchedulerStatus {
    const { raw } = this.getScheduleTime();
    return {
      enabled: this.isEnabled(),
      scheduleTime: raw,
      timezone: this.getTimezone(),
      active: this.timer !== null,
      nextScheduledRunAt: this.timer && this.nextRunDate ? this.nextRunDate.toISOString() : null,
      lastExecutedAt: this.lastExecutedAt ? this.lastExecutedAt.toISOString() : null,
      lastResult: this.lastResult,
    };
  }
}

export const demoResetScheduler = DemoResetScheduler.getInstance();
