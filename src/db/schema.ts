import { mysqlTable, varchar, text, timestamp, decimal, double, json, boolean, int, tinyint, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// 1. SHARED TABLES (Consumed from LockQuote Core Ecosystem)
// ============================================================================

// 1.1 Tenants table (Primary Business Context)
export const tenants = mysqlTable('tenants', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  businessPhone: varchar('business_phone', { length: 50 }),
  businessEmail: varchar('business_email', { length: 255 }),
  logoUrl: text('logo_url'),
  quoteRules: json('quote_rules'),
  notificationSettings: json('notification_settings'),
  emailTemplates: json('email_templates'),
  smsTemplates: json('sms_templates'),
});

// Relations for tenants
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  quotes: many(quotes),
  notifications: many(notifications),
  serviceAreas: many(serviceAreas),
  auditLogs: many(auditLogs),
  consents: many(consents),
  securityEvents: many(securityEvents),
  reviewRequests: many(reviewRequests),
  reviewFeedback: many(reviewFeedback),
  reviewPlatformSettings: many(reviewPlatformSettings),
  reviewTemplates: many(reviewTemplates),
}));

// 1.2 Users table (Admin & Staff Authentication Identities)
export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }),
  },
  (table) => [
    index('idx_users_tenant').on(table.tenantId),
    index('idx_users_email').on(table.email),
  ]
);

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

// 1.3 Leads table (Customers & Completed Service Requests)
export const leads = mysqlTable(
  'leads',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    postcode: varchar('postcode', { length: 20 }).notNull(),
    lat: double('lat'),
    lng: double('lng'),
    serviceType: varchar('service_type', { length: 100 }).notNull(),
    propertyType: varchar('property_type', { length: 100 }).notNull(),
    urgency: varchar('urgency', { length: 50 }).notNull(),
    message: text('message'),
    address: text('address'),
    quoteValue: varchar('quote_value', { length: 100 }),
    status: varchar('status', { length: 50 }).default('new').notNull(), // new, contacted, quoted, booked, completed, lost
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_leads_tenant').on(table.tenantId),
    index('idx_leads_status').on(table.status),
    index('idx_leads_created_at').on(table.createdAt),
  ]
);

export const leadsRelations = relations(leads, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [leads.tenantId],
    references: [tenants.id],
  }),
  quotes: many(quotes),
  notifications: many(notifications),
  consents: many(consents),
  reviewRequests: many(reviewRequests),
}));

// 1.4 Quotes table
export const quotes = mysqlTable(
  'quotes',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    leadId: varchar('lead_id', { length: 36 })
      .references(() => leads.id, { onDelete: 'cascade' })
      .notNull(),
    minPrice: decimal('min_price', { precision: 10, scale: 2 }).notNull(),
    maxPrice: decimal('max_price', { precision: 10, scale: 2 }).notNull(),
    quoteType: varchar('quote_type', { length: 50 }).notNull(),
  },
  (table) => [
    index('idx_quotes_tenant').on(table.tenantId),
    index('idx_quotes_lead').on(table.leadId),
  ]
);

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [quotes.tenantId],
    references: [tenants.id],
  }),
  lead: one(leads, {
    fields: [quotes.leadId],
    references: [leads.id],
  }),
  consents: many(consents),
  reviewRequests: many(reviewRequests),
}));

// 1.5 Notifications table
export const notifications = mysqlTable(
  'notifications',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    leadId: varchar('lead_id', { length: 36 })
      .references(() => leads.id, { onDelete: 'cascade' })
      .notNull(),
    channel: varchar('channel', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_notif_tenant').on(table.tenantId),
    index('idx_notif_lead').on(table.leadId),
  ]
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notifications.tenantId],
    references: [tenants.id],
  }),
  lead: one(leads, {
    fields: [notifications.leadId],
    references: [leads.id],
  }),
}));

// 1.6 Service Areas table
export const serviceAreas = mysqlTable(
  'service_areas',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    postcodePrefix: varchar('postcode_prefix', { length: 20 }).notNull(),
  },
  (table) => [
    index('idx_service_areas_tenant').on(table.tenantId),
  ]
);

export const serviceAreasRelations = relations(serviceAreas, ({ one }) => ({
  tenant: one(tenants, {
    fields: [serviceAreas.tenantId],
    references: [tenants.id],
  }),
}));

// 1.7 Audit Logs table
export const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    event: varchar('event', { length: 255 }).notNull(),
    metadata: json('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_logs_tenant').on(table.tenantId),
    index('idx_audit_logs_created_at').on(table.createdAt),
  ]
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
}));

// 1.8 Consents table (GDPR compliance records)
export const consents = mysqlTable(
  'consents',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    quoteId: varchar('quote_id', { length: 36 })
      .references(() => quotes.id, { onDelete: 'set null' }),
    leadId: varchar('lead_id', { length: 36 })
      .references(() => leads.id, { onDelete: 'set null' }),
    privacyPolicyVersion: varchar('privacy_policy_version', { length: 50 }).notNull(),
    termsVersion: varchar('terms_version', { length: 50 }).notNull(),
    consentType: varchar('consent_type', { length: 100 }).default('essential_quote').notNull(),
    marketingConsent: boolean('marketing_consent').default(false).notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    ipAddress: varchar('ip_address', { length: 100 }),
    userAgent: text('user_agent'),
    source: varchar('source', { length: 100 }).default('Instant Quote').notNull(),
    createdBy: varchar('created_by', { length: 100 }).default('System').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_consents_tenant').on(table.tenantId),
    index('idx_consents_lead').on(table.leadId),
    index('idx_consents_quote').on(table.quoteId),
  ]
);

export const consentsRelations = relations(consents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [consents.tenantId],
    references: [tenants.id],
  }),
  quote: one(quotes, {
    fields: [consents.quoteId],
    references: [quotes.id],
  }),
  lead: one(leads, {
    fields: [consents.leadId],
    references: [leads.id],
  }),
}));

// 1.9 Security Events table
export const securityEvents = mysqlTable(
  'security_events',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    severity: varchar('severity', { length: 50 }).default('info').notNull(), // info, warning, error, critical
    category: varchar('category', { length: 50 }).default('auth').notNull(), // auth, access_control, csrf, rate_limit, input_validation
    eventType: varchar('event_type', { length: 100 }).notNull(),
    description: text('description').notNull(),
    userId: varchar('user_id', { length: 36 }),
    username: varchar('username', { length: 255 }),
    role: varchar('role', { length: 50 }),
    ipAddress: varchar('ip_address', { length: 100 }),
    userAgent: text('user_agent'),
    url: text('url'),
    httpMethod: varchar('http_method', { length: 10 }),
    httpStatusCode: int('http_status_code'),
    additionalDetails: json('additional_details'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_security_events_tenant').on(table.tenantId),
    index('idx_security_events_timestamp').on(table.timestamp),
  ]
);

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [securityEvents.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================================================
// 2. LOCKREVIEW-OWNED TABLES
// ============================================================================

// 2.1 Review Requests table
export const reviewRequests = mysqlTable(
  'review_requests',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    leadId: varchar('lead_id', { length: 36 })
      .references(() => leads.id, { onDelete: 'cascade' })
      .notNull(),
    quoteId: varchar('quote_id', { length: 36 })
      .references(() => quotes.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, scheduled, sent, delivered, responded, positive, negative, failed, cancelled, expired
    channel: varchar('channel', { length: 20 }).default('sms').notNull(), // sms, email, both
    secureToken: varchar('secure_token', { length: 64 }).notNull(), // Cryptographically random public URL token
    tokenHash: varchar('token_hash', { length: 64 }), // Optional SHA-256 hash for extra security
    rating: tinyint('rating'), // 1-5 rating when responded
    sentAt: timestamp('sent_at'),
    respondedAt: timestamp('responded_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('idx_review_requests_tenant').on(table.tenantId),
    index('idx_review_requests_lead').on(table.leadId),
    index('idx_review_requests_status').on(table.status),
    index('idx_review_requests_created_at').on(table.createdAt),
    uniqueIndex('uniq_review_requests_token').on(table.secureToken),
  ]
);

export const reviewRequestsRelations = relations(reviewRequests, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [reviewRequests.tenantId],
    references: [tenants.id],
  }),
  lead: one(leads, {
    fields: [reviewRequests.leadId],
    references: [leads.id],
  }),
  quote: one(quotes, {
    fields: [reviewRequests.quoteId],
    references: [quotes.id],
  }),
  feedback: many(reviewFeedback),
}));

// 2.2 Review Feedback table (Customer Feedback & Public Platform Click Events)
export const reviewFeedback = mysqlTable(
  'review_feedback',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    reviewRequestId: varchar('review_request_id', { length: 36 })
      .references(() => reviewRequests.id, { onDelete: 'cascade' })
      .notNull(),
    rating: tinyint('rating').notNull(), // 1 to 5
    sentiment: varchar('sentiment', { length: 20 }).notNull(), // positive (4-5), negative (1-3)
    feedbackText: text('feedback_text'), // Private constructive comments
    publicPlatformClicked: boolean('public_platform_clicked').default(false).notNull(),
    publicPlatformName: varchar('public_platform_name', { length: 50 }), // e.g. google, trustpilot
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_review_feedback_tenant').on(table.tenantId),
    index('idx_review_feedback_request').on(table.reviewRequestId),
    index('idx_review_feedback_sentiment').on(table.sentiment),
  ]
);

export const reviewFeedbackRelations = relations(reviewFeedback, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reviewFeedback.tenantId],
    references: [tenants.id],
  }),
  reviewRequest: one(reviewRequests, {
    fields: [reviewFeedback.reviewRequestId],
    references: [reviewRequests.id],
  }),
}));

// 2.3 Review Platform Settings table (Google Reviews, Trustpilot, Checkatrade, etc.)
export const reviewPlatformSettings = mysqlTable(
  'review_platform_settings',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    platformName: varchar('platform_name', { length: 50 }).notNull(), // google, trustpilot, checkatrade, facebook
    destinationUrl: text('destination_url').notNull(),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('idx_review_platform_tenant').on(table.tenantId),
    index('idx_review_platform_name').on(table.platformName),
  ]
);

export const reviewPlatformSettingsRelations = relations(reviewPlatformSettings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reviewPlatformSettings.tenantId],
    references: [tenants.id],
  }),
}));

// 2.4 Review Templates table
export const reviewTemplates = mysqlTable(
  'review_templates',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 })
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    channel: varchar('channel', { length: 20 }).notNull(), // sms, email
    templateName: varchar('template_name', { length: 100 }).notNull(),
    subject: varchar('subject', { length: 255 }), // for email
    bodyTemplate: text('body_template').notNull(), // Contains {customer_name}, {business_name}, {review_link}
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('idx_review_templates_tenant').on(table.tenantId),
    index('idx_review_templates_channel').on(table.channel),
  ]
);

export const reviewTemplatesRelations = relations(reviewTemplates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reviewTemplates.tenantId],
    references: [tenants.id],
  }),
}));
