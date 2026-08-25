import { DEFAULT_TENANT_ID, DEFAULT_SMS_REVIEW_TEMPLATE, DEFAULT_EMAIL_REVIEW_TEMPLATE, DEFAULT_REVIEW_PLATFORMS } from './constants';

export const mockTenants = [
  {
    id: DEFAULT_TENANT_ID,
    name: 'Atypikal Locksmith Services',
    businessPhone: '+447700900077',
    businessEmail: 'support@atypikalstudio.dev',
    logoUrl: '/lockquote-icon-lt-sq.png',
    createdAt: new Date(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Metro 24/7 Locksmiths',
    businessPhone: '+447700900088',
    businessEmail: 'admin@metrolocksmiths.co.uk',
    logoUrl: null,
    createdAt: new Date(),
  }
];

export const mockUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    tenantId: DEFAULT_TENANT_ID,
    email: 'support@atypikalstudio.dev',
    password: 'MockPassword123!',
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    tenantId: DEFAULT_TENANT_ID,
    email: 'admin@yoursite.com',
    password: 'password',
  },
  {
    id: '22222222-2222-2222-2222-222222222221',
    tenantId: '22222222-2222-2222-2222-222222222222',
    email: 'admin@metrolocksmiths.co.uk',
    password: 'password',
  }
];

export const mockLeads = [
  {
    id: 'lead-001',
    tenantId: DEFAULT_TENANT_ID,
    name: 'James Walker',
    phone: '+447911123456',
    email: 'james.walker@example.com',
    postcode: 'SW1A 1AA',
    serviceType: 'Emergency Lockout',
    propertyType: 'House',
    urgency: 'Emergency',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2),
  },
  {
    id: 'lead-002',
    tenantId: DEFAULT_TENANT_ID,
    name: 'Sarah Jenkins',
    phone: '+447922234567',
    email: 'sarah.j@example.co.uk',
    postcode: 'E1 6AN',
    serviceType: 'Lock Replacement',
    propertyType: 'Flat',
    urgency: 'Same Day',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5),
  },
  {
    id: 'lead-003',
    tenantId: DEFAULT_TENANT_ID,
    name: 'Robert Taylor',
    phone: '+447933345678',
    email: 'robert.t@example.com',
    postcode: 'W1D 3QU',
    serviceType: 'UPVC Mechanism Repair',
    propertyType: 'Commercial Unit',
    urgency: 'Flexible',
    status: 'booked',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1),
  },
  {
    id: 'lead-other-tenant',
    tenantId: '22222222-2222-2222-2222-222222222222',
    name: 'Isolated Customer',
    phone: '+447999999999',
    email: 'isolated@example.com',
    postcode: 'M1 1AE',
    serviceType: 'Key Duplication',
    propertyType: 'Office',
    urgency: 'Same Day',
    status: 'completed',
    createdAt: new Date(),
  }
];

export const mockReviewRequests = [
  {
    id: 'req-001',
    tenantId: DEFAULT_TENANT_ID,
    leadId: 'lead-001',
    status: 'positive',
    channel: 'sms',
    secureToken: 'tok_demo_positive_12345',
    rating: 5,
    sentAt: new Date(Date.now() - 3600000 * 20),
    respondedAt: new Date(Date.now() - 3600000 * 18),
    expiresAt: new Date(Date.now() + 3600000 * 24 * 7),
    createdAt: new Date(Date.now() - 3600000 * 20),
    updatedAt: new Date(Date.now() - 3600000 * 18),
  },
  {
    id: 'req-002',
    tenantId: DEFAULT_TENANT_ID,
    leadId: 'lead-002',
    status: 'sent',
    channel: 'email',
    secureToken: 'tok_demo_pending_67890',
    rating: null,
    sentAt: new Date(Date.now() - 3600000 * 4),
    respondedAt: null,
    expiresAt: new Date(Date.now() + 3600000 * 24 * 7),
    createdAt: new Date(Date.now() - 3600000 * 4),
    updatedAt: new Date(Date.now() - 3600000 * 4),
  }
];

export const mockReviewFeedback = [
  {
    id: 'fb-001',
    tenantId: DEFAULT_TENANT_ID,
    reviewRequestId: 'req-001',
    rating: 5,
    sentiment: 'positive',
    feedbackText: null,
    publicPlatformClicked: true,
    publicPlatformName: 'google',
    createdAt: new Date(Date.now() - 3600000 * 18),
  }
];

export const mockPlatformSettings = DEFAULT_REVIEW_PLATFORMS.map((p, idx) => ({
  id: `plat-${idx + 1}`,
  tenantId: DEFAULT_TENANT_ID,
  platformName: p.platformName,
  destinationUrl: p.destinationUrl,
  isEnabled: p.isEnabled,
  createdAt: new Date(),
  updatedAt: new Date(),
}));
export const mockReviewPlatformSettings = mockPlatformSettings;

export const mockReviewTemplates = [
  {
    id: 'tpl-sms-default',
    tenantId: DEFAULT_TENANT_ID,
    channel: 'sms',
    templateName: 'Default SMS Review Request',
    subject: null,
    bodyTemplate: DEFAULT_SMS_REVIEW_TEMPLATE,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tpl-email-default',
    tenantId: DEFAULT_TENANT_ID,
    channel: 'email',
    templateName: 'Default Email Review Request',
    subject: 'How was your locksmith service with {business_name}?',
    bodyTemplate: DEFAULT_EMAIL_REVIEW_TEMPLATE,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockSecurityEvents: any[] = [];
export const mockAuditLogs: any[] = [];

function createChainableQuery(defaultResult: any = []): any {
  const promise = Promise.resolve(defaultResult);
  const chain: any = {
    leftJoin: () => chain,
    rightJoin: () => chain,
    innerJoin: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    offset: () => chain,
    groupBy: () => chain,
    having: () => chain,
    then: (onfulfilled?: any, onrejected?: any) => promise.then(onfulfilled, onrejected),
    catch: (onrejected?: any) => promise.catch(onrejected),
    finally: (onfinally?: any) => promise.finally(onfinally),
  };
  return chain;
}

// Lightweight Query Mocking Fallback
export const mockDb = {
  select: (_fields?: any) => ({
    from: (_table: any) => createChainableQuery([]),
  }),
  insert: (_table?: any) => ({
    values: (_val: any) => Promise.resolve({ insertId: 'mock-id', affectedRows: 1 }),
  }),
  update: (_table?: any) => ({
    set: (_val: any) => createChainableQuery({ affectedRows: 1 }),
  }),
  delete: (_table?: any) => ({
    where: (_clause?: any) => Promise.resolve({ affectedRows: 1 }),
  }),
};
