import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to parse and load .env files without external dependencies
function loadEnvFile(filePath) {
  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const equalIdx = trimmed.indexOf('=');
        if (equalIdx > 0) {
          const key = trimmed.slice(0, equalIdx).trim();
          let val = trimmed.slice(equalIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    } catch (e) {
      console.warn(`Could not read ${filePath}: ${e.message}`);
    }
  }
}

// Load .env.local first, then .env
loadEnvFile(join(__dirname, '..', '.env.local'));
loadEnvFile(join(__dirname, '..', '.env'));

function getDbConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && databaseUrl.startsWith('mysql://')) {
    try {
      const parsedUrl = new URL(databaseUrl);
      return {
        host: parsedUrl.hostname || 'localhost',
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306,
        user: decodeURIComponent(parsedUrl.username || 'root'),
        password: decodeURIComponent(parsedUrl.password || ''),
        database: parsedUrl.pathname.replace(/^\//, '') || 'lockquote',
      };
    } catch (_) {
      console.warn('URL parsing failed, falling back to direct host variables');
    }
  }

  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'lockquote',
  };
}

async function initLockReviewMySQL() {
  const config = getDbConfig();
  console.log(`\n🐬 Initializing LockReview MySQL Schema on [${config.host}:${config.port}] -> Database [${config.database}] as [${config.user}]...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      multipleStatements: true,
      connectTimeout: 10000,
    });
    console.log('✓ Successfully connected to shared MySQL database.');
  } catch (connErr) {
    console.error('\n⚠️ Could not connect to live MySQL server (using offline mode / memory fallback):', connErr.message);
    console.log('  If running in development without a local MySQL daemon, LockReview will use safe in-memory fallback.\n');
    return;
  }

  try {
    console.log('\nApplying LockReview schema additions...');

    // 1. review_requests
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`review_requests\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`lead_id\` VARCHAR(36) NOT NULL,
        \`quote_id\` VARCHAR(36) NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
        \`channel\` VARCHAR(20) NOT NULL DEFAULT 'sms',
        \`secure_token\` VARCHAR(64) NOT NULL,
        \`token_hash\` VARCHAR(64) NULL,
        \`rating\` TINYINT NULL,
        \`sent_at\` TIMESTAMP NULL DEFAULT NULL,
        \`responded_at\` TIMESTAMP NULL DEFAULT NULL,
        \`expires_at\` TIMESTAMP NULL DEFAULT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`uniq_review_requests_token\` (\`secure_token\`),
        INDEX \`idx_review_requests_tenant\` (\`tenant_id\`),
        INDEX \`idx_review_requests_lead\` (\`lead_id\`),
        INDEX \`idx_review_requests_status\` (\`status\`),
        INDEX \`idx_review_requests_created_at\` (\`created_at\`),
        CONSTRAINT \`fk_review_req_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_review_req_lead\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_review_req_quote\` FOREIGN KEY (\`quote_id\` ) REFERENCES \`quotes\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ review_requests table verified');

    // 2. review_feedback
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`review_feedback\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`review_request_id\` VARCHAR(36) NOT NULL,
        \`rating\` TINYINT NOT NULL,
        \`sentiment\` VARCHAR(20) NOT NULL,
        \`feedback_text\` TEXT NULL,
        \`public_platform_clicked\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`public_platform_name\` VARCHAR(50) NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_review_feedback_tenant\` (\`tenant_id\`),
        INDEX \`idx_review_feedback_request\` (\`review_request_id\`),
        INDEX \`idx_review_feedback_sentiment\` (\`sentiment\`),
        CONSTRAINT \`fk_review_feedback_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_review_feedback_request\` FOREIGN KEY (\`review_request_id\`) REFERENCES \`review_requests\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ review_feedback table verified');

    // 3. review_platform_settings
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`review_platform_settings\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`platform_name\` VARCHAR(50) NOT NULL,
        \`destination_url\` TEXT NOT NULL,
        \`is_enabled\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_review_platform_tenant\` (\`tenant_id\`),
        INDEX \`idx_review_platform_name\` (\`platform_name\`),
        CONSTRAINT \`fk_review_platform_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ review_platform_settings table verified');

    // 4. review_templates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`review_templates\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`channel\` VARCHAR(20) NOT NULL,
        \`template_name\` VARCHAR(100) NOT NULL,
        \`subject\` VARCHAR(255) NULL,
        \`body_template\` TEXT NOT NULL,
        \`is_default\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_review_templates_tenant\` (\`tenant_id\`),
        INDEX \`idx_review_templates_channel\` (\`channel\`),
        CONSTRAINT \`fk_review_templates_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ review_templates table verified');

    // Seed default platform destinations and review templates
    const defaultTenantId = '00000000-0000-0000-0000-000000000001';
    console.log('\nSeeding default review settings and templates...');

    // Google review destination
    await connection.query(`
      INSERT INTO \`review_platform_settings\` (
        \`id\`, \`tenant_id\`, \`platform_name\`, \`destination_url\`, \`is_enabled\`
      ) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE \`destination_url\` = VALUES(\`destination_url\`);
    `, [
      'plat-google-default',
      defaultTenantId,
      'google',
      'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      1,
    ]);

    // SMS review template
    await connection.query(`
      INSERT INTO \`review_templates\` (
        \`id\`, \`tenant_id\`, \`channel\`, \`template_name\`, \`subject\`, \`body_template\`, \`is_default\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE \`body_template\` = VALUES(\`body_template\`);
    `, [
      'tpl-sms-default',
      defaultTenantId,
      'sms',
      'Default SMS Review Request',
      null,
      'Hi {customer_name}, thank you for choosing {business_name}! Could you take 30 seconds to share how we did? {review_link}',
      1,
    ]);

    // Email review template
    await connection.query(`
      INSERT INTO \`review_templates\` (
        \`id\`, \`tenant_id\`, \`channel\`, \`template_name\`, \`subject\`, \`body_template\`, \`is_default\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE \`body_template\` = VALUES(\`body_template\`);
    `, [
      'tpl-email-default',
      defaultTenantId,
      'email',
      'Default Email Review Request',
      'How was your locksmith service with {business_name}?',
      'Hi {customer_name},\n\nThank you for choosing {business_name}. Please rate your service here: {review_link}',
      1,
    ]);

    console.log('✓ Default platform destination and templates seeded.');
    console.log('\n🎉 LockReview MySQL schema initialization completed successfully!\n');
  } catch (err) {
    console.error('\n❌ Error during LockReview schema migration:', err);
  } finally {
    if (connection) await connection.end();
  }
}

initLockReviewMySQL();
