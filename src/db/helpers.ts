import { db } from './index';
import { tenants, users } from './schema';
import { eq } from 'drizzle-orm';
import {
  DEFAULT_TENANT_ID,
  DEFAULT_SMS_REVIEW_TEMPLATE,
  DEFAULT_EMAIL_REVIEW_TEMPLATE,
  DEFAULT_REVIEW_PLATFORMS,
} from './constants';
import { mockTenants } from './mock';

export { DEFAULT_TENANT_ID, DEFAULT_SMS_REVIEW_TEMPLATE, DEFAULT_EMAIL_REVIEW_TEMPLATE, DEFAULT_REVIEW_PLATFORMS };

export async function getOrCreateDefaultTenant() {
  try {
    const existing = await db.select().from(tenants).where(eq(tenants.id, DEFAULT_TENANT_ID));
    if (existing.length > 0) {
      return existing[0];
    }

    // Default tenant definition compatible with LockQuote
    const newTenantData = {
      id: DEFAULT_TENANT_ID,
      name: 'DEMO Locksmith',
      businessPhone: '+447700900077',
      businessEmail: process.env.BUSINESS_EMAIL || 'support@atypikalstudio.dev',
      logoUrl: '/lockquote-icon-lt-sq.png',
    };

    await db.insert(tenants).values(newTenantData);

    // Also seed a default user for testing if missing
    const existingUser = await db.select().from(users).where(eq(users.tenantId, DEFAULT_TENANT_ID));
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: '11111111-1111-1111-1111-111111111111',
        tenantId: DEFAULT_TENANT_ID,
        email: 'support@atypikalstudio.dev',
        password: 'MockPassword123!',
      });
    }

    return newTenantData;
  } catch (error) {
    console.error('Error during tenant initialization:', error);
    return mockTenants[0];
  }
}

export async function getTenantById(tenantId?: string) {
  try {
    if (tenantId) {
      const res = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
      if (res && res.length > 0) return res[0];
    }
    const anyTenant = await db.select().from(tenants).limit(1);
    if (anyTenant && anyTenant.length > 0) return anyTenant[0];
    return mockTenants[0] || null;
  } catch (err) {
    console.warn('[DB] getTenantById fallback to mock:', err);
    return mockTenants[0] || null;
  }
}
