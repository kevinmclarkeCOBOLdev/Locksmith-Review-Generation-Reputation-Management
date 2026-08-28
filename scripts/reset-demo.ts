import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local first, then fallback to .env
config({ path: join(process.cwd(), '.env.local') });
config({ path: join(process.cwd(), '.env') });

async function run() {
  // Dynamically import database and demoResetService after dotenv is configured
  const { checkDatabaseConnection } = await import('../src/db');
  const { demoResetService } = await import('../src/services/demo');

  console.log('--- LockReview Local Demo Reset CLI Runner ---');
  const dbStatus = await checkDatabaseConnection();
  console.log(`[Database Connection] Target Host: ${process.env.MYSQL_HOST || 'local/default'}, Database: ${process.env.MYSQL_DATABASE || 'lockquote'}`);
  console.log(`[Database Connection] Live MySQL Status: ${dbStatus.connected ? 'CONNECTED (Live Database)' : `FALLBACK (In-Memory Mock) - Reason: ${dbStatus.error}`}`);

  try {
    const result = await demoResetService.executeDemoReset({
      triggeredBy: 'Local CLI Script',
    });
    console.log('\nLockReview demo database reset completed successfully:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Demo database reset failed:', error.message || error);
    process.exit(1);
  }
}

run();
