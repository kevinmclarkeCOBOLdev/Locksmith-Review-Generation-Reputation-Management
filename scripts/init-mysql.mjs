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
      connectTimeout: 15000,
    });
    console.log('✓ Successfully connected to shared MySQL database.');
  } catch (connErr) {
    console.error('\n⚠️ Could not connect to live MySQL server:', connErr.message);
    console.log('  Please verify your host, user, password, and database in .env.local or Hostinger environment.\n');
    return;
  }

  try {
    console.log('\n--- 1. Verifying Core Shared Tables ---');

    // 1.1 tenants
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`tenants\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`business_phone\` VARCHAR(50) NULL,
        \`business_email\` VARCHAR(255) NULL,
        \`logo_url\` TEXT NULL,
        \`quote_rules\` JSON NULL,
        \`notification_settings\` JSON NULL,
        \`email_templates\` JSON NULL,
        \`sms_templates\` JSON NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ tenants table verified');

    // 1.2 users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`password\` VARCHAR(255) NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_users_tenant\` (\`tenant_id\`),
        INDEX \`idx_users_email\` (\`email\`),
        CONSTRAINT \`fk_users_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ users table verified');

    // 1.3 leads
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`leads\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(50) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`postcode\` VARCHAR(20) NOT NULL,
        \`lat\` DOUBLE NULL,
        \`lng\` DOUBLE NULL,
        \`service_type\` VARCHAR(100) NOT NULL,
        \`property_type\` VARCHAR(100) NOT NULL,
        \`urgency\` VARCHAR(50) NOT NULL,
        \`message\` TEXT NULL,
        \`address\` TEXT NULL,
        \`quote_value\` VARCHAR(100) NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'new',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_leads_tenant\` (\`tenant_id\`),
        INDEX \`idx_leads_status\` (\`status\`),
        INDEX \`idx_leads_created_at\` (\`created_at\`),
        CONSTRAINT \`fk_leads_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ leads table verified');

    // 1.4 quotes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`quotes\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`lead_id\` VARCHAR(36) NOT NULL,
        \`min_price\` DECIMAL(10, 2) NOT NULL,
        \`max_price\` DECIMAL(10, 2) NOT NULL,
        \`quote_type\` VARCHAR(50) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_quotes_tenant\` (\`tenant_id\`),
        INDEX \`idx_quotes_lead\` (\`lead_id\`),
        CONSTRAINT \`fk_quotes_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_quotes_lead\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ quotes table verified');

    // 1.5 audit_logs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`event\` VARCHAR(255) NOT NULL,
        \`metadata\` JSON NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_audit_logs_tenant\` (\`tenant_id\`),
        INDEX \`idx_audit_logs_created_at\` (\`created_at\`),
        CONSTRAINT \`fk_audit_logs_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ audit_logs table verified');

    // 1.6 security_events
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`security_events\` (
        \`id\` VARCHAR(64) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`timestamp\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`severity\` VARCHAR(50) NOT NULL DEFAULT 'info',
        \`category\` VARCHAR(50) NOT NULL DEFAULT 'auth',
        \`event_type\` VARCHAR(100) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`user_id\` VARCHAR(36) NULL,
        \`username\` VARCHAR(255) NULL,
        \`role\` VARCHAR(50) NULL,
        \`ip_address\` VARCHAR(100) NULL,
        \`user_agent\` TEXT NULL,
        \`url\` TEXT NULL,
        \`http_method\` VARCHAR(10) NULL,
        \`http_status_code\` INT NULL,
        \`additional_details\` JSON NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_sec_events_tenant\` (\`tenant_id\`),
        INDEX \`idx_sec_events_timestamp\` (\`timestamp\`),
        CONSTRAINT \`fk_security_events_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ security_events table verified');

    console.log('\n--- 2. Verifying LockReview-Owned Tables ---');

    // 2.1 review_requests
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
        CONSTRAINT \`fk_review_req_quote\` FOREIGN KEY (\`quote_id\`) REFERENCES \`quotes\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  ✓ review_requests table verified');

    // 2.2 review_feedback
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

    // 2.3 review_platform_settings
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

    // 2.4 review_templates
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

    console.log('\n--- 3. Seeding Authoritative Demo & Default Data ---');
    const defaultTenantId = process.env.DEFAULT_TENANT_ID || '00000000-0000-0000-0000-000000000000';

    // 3.1 Default Tenant
    await connection.query(`
      INSERT INTO \`tenants\` (\`id\`, \`name\`, \`business_phone\`, \`business_email\`, \`logo_url\`)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        \`business_phone\` = VALUES(\`business_phone\`),
        \`business_email\` = VALUES(\`business_email\`);
    `, [
      defaultTenantId,
      'DEMO Locksmith',
      '+447700900077',
      'support@atypikalstudio.dev',
      '/lockquote-icon-lt-sq.png',
    ]);
    console.log('  ✓ Default tenant seeded (DEMO Locksmith)');

    // 3.2 Demo Users
    await connection.query(`
      INSERT INTO \`users\` (\`id\`, \`tenant_id\`, \`email\`, \`password\`)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE \`password\` = VALUES(\`password\`);
    `, [
      '11111111-1111-1111-1111-111111111111',
      defaultTenantId,
      'support@atypikalstudio.dev',
      'MockPassword123!',
    ]);

    await connection.query(`
      INSERT INTO \`users\` (\`id\`, \`tenant_id\`, \`email\`, \`password\`)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE \`password\` = VALUES(\`password\`);
    `, [
      '11111111-1111-1111-1111-111111111112',
      defaultTenantId,
      'admin@yoursite.com',
      'password',
    ]);

    await connection.query(`
      INSERT INTO \`users\` (\`id\`, \`tenant_id\`, \`email\`, \`password\`)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE \`password\` = VALUES(\`password\`);
    `, [
      '11111111-1111-1111-1111-111111111113',
      defaultTenantId,
      'admin@yoursite.co.uk',
      'password123',
    ]);
    console.log('  ✓ Demo users seeded (support@atypikalstudio.dev, admin@yoursite.com, admin@yoursite.co.uk)');

    // 3.3 Demo Completed Leads (Using standard columns: id, tenant_id, name, phone, email, postcode, service_type, property_type, urgency, quote_value, status)
    await connection.query(`
      INSERT INTO \`leads\` (\`id\`, \`tenant_id\`, \`name\`, \`phone\`, \`email\`, \`postcode\`, \`service_type\`, \`property_type\`, \`urgency\`, \`quote_value\`, \`status\`)
      VALUES 
        (?, ?, 'James Walker', '+447911123456', 'james.walker@example.com', 'SW1A 1AA', 'Emergency Lockout', 'House', 'Emergency', '£145.00', 'completed'),
        (?, ?, 'Sarah Jenkins', '+447922234567', 'sarah.j@example.co.uk', 'E1 6AN', 'Lock Replacement', 'Flat', 'Same Day', '£220.00', 'completed'),
        (?, ?, 'Robert Taylor', '+447933345678', 'robert.t@example.com', 'W1D 3QU', 'UPVC Mechanism Repair', 'Commercial Unit', 'Flexible', '£185.00', 'completed')
      ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`);
    `, [
      'lead-001', defaultTenantId,
      'lead-002', defaultTenantId,
      'lead-003', defaultTenantId,
    ]);
    console.log('  ✓ Demo completed leads seeded (James Walker, Sarah Jenkins, Robert Taylor)');

    // 3.4 Reputation Review Platform Settings (Google, Trustpilot, Checkatrade)
    await connection.query(`
      INSERT INTO \`review_platform_settings\` (\`id\`, \`tenant_id\`, \`platform_name\`, \`destination_url\`, \`is_enabled\`)
      VALUES 
        ('plat-google-default', ?, 'google', 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4', 1),
        ('plat-trustpilot-default', ?, 'trustpilot', 'https://uk.trustpilot.com/evaluate/atypikalstudio.dev', 0),
        ('plat-checkatrade-default', ?, 'checkatrade', 'https://www.checkatrade.com/trades/atypikallocksmiths', 0)
      ON DUPLICATE KEY UPDATE \`destination_url\` = VALUES(\`destination_url\`);
    `, [defaultTenantId, defaultTenantId, defaultTenantId]);
    console.log('  ✓ Review platforms seeded (Google Business Profile, Trustpilot, Checkatrade)');

    // 3.5 SMS & Email Review Templates
    await connection.query(`
      INSERT INTO \`review_templates\` (\`id\`, \`tenant_id\`, \`channel\`, \`template_name\`, \`subject\`, \`body_template\`, \`is_default\`)
      VALUES 
        ('tpl-sms-default', ?, 'sms', 'Default SMS Review Request', NULL, 'Hi {customer_name}, thank you for choosing {business_name}! Could you take 30 seconds to share how we did? {review_link}', 1),
        ('tpl-email-default', ?, 'email', 'Default Email Review Request', 'How was your locksmith service with {business_name}?', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;"><h2 style="color: #0f172a;">How did we do?</h2><p>Hi {customer_name},</p><p>Thank you for choosing <strong>{business_name}</strong>. Please rate your service here:</p><div style="text-align: center; margin: 24px 0;"><a href="{review_link}" style="background-color: #00d492; color: #022c22; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Leave Your Review</a></div></div>', 1)
      ON DUPLICATE KEY UPDATE \`body_template\` = VALUES(\`body_template\`);
    `, [defaultTenantId, defaultTenantId]);
    console.log('  ✓ Default SMS & Email review templates seeded');

    // 3.6 Sample Review Requests & Verified Feedback Entries
    await connection.query(`
      INSERT INTO \`review_requests\` 
        (\`id\`, \`tenant_id\`, \`lead_id\`, \`status\`, \`channel\`, \`secure_token\`, \`rating\`, \`sent_at\`, \`responded_at\`, \`expires_at\`)
      VALUES 
        ('req-demo-001', ?, 'lead-001', 'positive', 'sms', 'tok_demo_positive_12345', 5, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY)),
        ('req-demo-002', ?, 'lead-002', 'negative', 'email', 'tok_demo_negative_67890', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY)),
        ('req-demo-003', ?, 'lead-003', 'sent', 'sms', 'tok_demo_pending_11223', NULL, NOW(), NULL, DATE_ADD(NOW(), INTERVAL 7 DAY))
      ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`);
    `, [defaultTenantId, defaultTenantId, defaultTenantId]);

    // Positive 5-star Google review click
    await connection.query(`
      INSERT INTO \`review_feedback\` 
        (\`id\`, \`tenant_id\`, \`review_request_id\`, \`rating\`, \`sentiment\`, \`feedback_text\`, \`public_platform_clicked\`, \`public_platform_name\`)
      VALUES 
        ('fb-demo-001', ?, 'req-demo-001', 5, 'positive', NULL, 1, 'google'),
        ('fb-demo-002', ?, 'req-demo-002', 2, 'negative', 'The technician arrived 20 minutes after the estimated time window, though the lock itself works great.', 0, NULL)
      ON DUPLICATE KEY UPDATE \`rating\` = VALUES(\`rating\`);
    `, [defaultTenantId, defaultTenantId]);
    console.log('  ✓ Demo review requests & customer feedback records seeded');

    console.log('\n=============================================================');
    console.log('🎉 LockReview MySQL schema & demo data setup complete!');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('\n❌ Error during LockReview schema migration:', err);
  } finally {
    if (connection) await connection.end();
  }
}

initLockReviewMySQL();
