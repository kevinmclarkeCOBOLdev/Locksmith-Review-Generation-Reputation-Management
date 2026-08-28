/**
 * Next.js Server Lifecycle Instrumentation Hook
 * 
 * Runs automatically when the Next.js Node.js server instance starts.
 * Initializes background timers and schedulers (e.g. nightly demo reset at 02:00).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { demoResetScheduler } = await import('@/services/demo');

      // Initialize in-process 02:00 nightly demo reset scheduler
      demoResetScheduler.startScheduler();

      console.log('[Instrumentation] LockReview background schedulers registered successfully.');
    } catch (error) {
      console.error('[Instrumentation] Error registering background schedulers:', error);
    }
  }
}
