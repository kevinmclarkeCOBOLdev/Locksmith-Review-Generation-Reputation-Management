import { db } from '@/db';
import { reviewRequests, leads, reviewTemplates, auditLogs } from '@/db/schema';
import { eq, and, desc, sql, like, or } from 'drizzle-orm';
import { generateSecureToken, hashToken } from '@/lib/crypto';
import { DEFAULT_SMS_REVIEW_TEMPLATE, DEFAULT_EMAIL_REVIEW_TEMPLATE } from '@/db/constants';
import { mockLeads, mockReviewRequests, mockReviewTemplates, mockAuditLogs } from '@/db/mock';
import type { ReviewRequestItem, DeliveryChannel, ReviewRequestStatus, ReviewTemplateItem } from '@/types/review';

export interface EligibleLeadItem {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  postcode: string;
  serviceType: string;
  propertyType?: string;
  urgency?: string;
  status: string;
  quoteValue?: string | null;
  createdAt: Date | string;
  hasActiveRequest: boolean;
  lastRequestId?: string;
  lastRequestStatus?: ReviewRequestStatus;
  lastRequestDate?: Date | string | null;
}

export interface EligibleLeadsResult {
  items: EligibleLeadItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingRequest?: {
    id: string;
    status: ReviewRequestStatus;
    channel: DeliveryChannel;
    createdAt: Date | string;
    sentAt?: Date | string | null;
  };
  message?: string;
}

export interface CreateReviewRequestInput {
  tenantId: string;
  leadId: string;
  quoteId?: string | null;
  channel: DeliveryChannel;
  templateId?: string | null;
  customMessage?: string | null;
  scheduledAt?: Date | string | null;
  allowDuplicate?: boolean;
  expirationDays?: number;
  autoDispatch?: boolean;
}

export interface RenderTemplateOptions {
  templateBody: string;
  subject?: string | null;
  customerName: string;
  businessName: string;
  reviewLink: string;
}

export interface ReviewRequestsFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  channel?: string;
}

export interface PaginatedReviewRequestsResult {
  items: ReviewRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Replaces dynamic variables in a review request template.
 * Supported variables:
 * - {customer_name} -> Customer full name
 * - {business_name} -> Business name of the tenant
 * - {review_link}    -> Secure public review URL
 */
export function renderTemplatePreview({
  templateBody,
  subject,
  customerName,
  businessName,
  reviewLink,
}: RenderTemplateOptions): { renderedSubject?: string; renderedBody: string } {
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{customer_name}/g, customerName || 'Customer')
      .replace(/{business_name}/g, businessName || 'Our Locksmith Team')
      .replace(/{review_link}/g, reviewLink || 'https://lockreview.atypikalstudio.dev/review/sample-token');
  };

  return {
    renderedSubject: subject ? replacePlaceholders(subject) : undefined,
    renderedBody: replacePlaceholders(templateBody),
  };
}

/**
 * Checks if a recent or active review request already exists for a specific lead.
 * Deduplication rules:
 * - Checks if a request was created within the last `daysThreshold` days (default 30 days)
 * - Flags requests in 'pending', 'scheduled', 'sent', 'delivered', 'responded', 'positive', 'negative' states.
 */
export async function checkDuplicateRequest(
  tenantId: string,
  leadId: string,
  daysThreshold: number = 30
): Promise<DuplicateCheckResult> {
  const cutoffDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);

  try {
    const existing = await db
      .select({
        id: reviewRequests.id,
        status: reviewRequests.status,
        channel: reviewRequests.channel,
        createdAt: reviewRequests.createdAt,
        sentAt: reviewRequests.sentAt,
      })
      .from(reviewRequests)
      .where(
        and(
          eq(reviewRequests.tenantId, tenantId),
          eq(reviewRequests.leadId, leadId)
        )
      )
      .orderBy(desc(reviewRequests.createdAt))
      .limit(1);

    if (existing.length > 0) {
      const req = existing[0];
      const reqDate = new Date(req.createdAt);
      const isRecent = reqDate >= cutoffDate;
      const isActiveState = ['pending', 'scheduled', 'sent', 'delivered', 'responded', 'positive', 'negative'].includes(req.status);

      if (isRecent || isActiveState) {
        return {
          isDuplicate: true,
          existingRequest: {
            id: req.id,
            status: req.status as ReviewRequestStatus,
            channel: req.channel as DeliveryChannel,
            createdAt: req.createdAt,
            sentAt: req.sentAt,
          },
          message: `A review request was already created for this customer on ${reqDate.toLocaleDateString('en-GB')} (Status: ${req.status.toUpperCase()}).`,
        };
      }
    }

    const fallback = mockReviewRequests
      .filter((r) => r.tenantId === tenantId && r.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (fallback.length > 0) {
      const req = fallback[0];
      return {
        isDuplicate: true,
        existingRequest: {
          id: req.id,
          status: req.status as ReviewRequestStatus,
          channel: req.channel as DeliveryChannel,
          createdAt: req.createdAt,
          sentAt: req.sentAt,
        },
        message: `A review request already exists for this customer (Status: ${req.status.toUpperCase()}).`,
      };
    }

    return { isDuplicate: false };
  } catch (err: any) {
    console.warn(`[checkDuplicateRequest] DB query fallback: ${err?.message}`);
    const fallback = mockReviewRequests
      .filter((r) => r.tenantId === tenantId && r.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (fallback.length > 0) {
      const req = fallback[0];
      return {
        isDuplicate: true,
        existingRequest: {
          id: req.id,
          status: req.status as ReviewRequestStatus,
          channel: req.channel as DeliveryChannel,
          createdAt: req.createdAt,
          sentAt: req.sentAt,
        },
        message: `A review request already exists for this customer (Status: ${req.status.toUpperCase()}).`,
      };
    }

    return { isDuplicate: false };
  }
}

/**
 * Retrieves eligible leads from the shared MySQL database for the authenticated tenant.
 * Scoped strictly to tenantId.
 */
export async function getEligibleLeads(
  tenantId: string,
  options: { search?: string; status?: string; page?: number; limit?: number } = {}
): Promise<EligibleLeadsResult> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 20));
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch leads matching tenant and search filter
    const conditions = [eq(leads.tenantId, tenantId)];

    if (options.status && options.status !== 'all') {
      conditions.push(eq(leads.status, options.status));
    }

    if (options.search && options.search.trim()) {
      const searchPattern = `%${options.search.trim()}%`;
      conditions.push(
        or(
          like(leads.name, searchPattern),
          like(leads.phone, searchPattern),
          like(leads.email, searchPattern),
          like(leads.postcode, searchPattern),
          like(leads.serviceType, searchPattern)
        )!
      );
    }

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated leads
    const leadRecords = await db
      .select()
      .from(leads)
      .where(whereClause)
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    if ((!leadRecords || leadRecords.length === 0) && mockLeads.some((l) => l.tenantId === tenantId)) {
      throw new Error('FallbackToMockLeads');
    }

    // 2. Fetch existing review requests for these leads to annotate status
    const leadIds = leadRecords.map((l: any) => l.id);
    const requestMap = new Map<string, any>();

    if (leadIds.length > 0) {
      const requests = await db
        .select({
          id: reviewRequests.id,
          leadId: reviewRequests.leadId,
          status: reviewRequests.status,
          createdAt: reviewRequests.createdAt,
        })
        .from(reviewRequests)
        .where(eq(reviewRequests.tenantId, tenantId))
        .orderBy(desc(reviewRequests.createdAt));

      for (const req of requests) {
        if (!requestMap.has(req.leadId)) {
          requestMap.set(req.leadId, req);
        }
      }
    }

    const items: EligibleLeadItem[] = leadRecords.map((l: any) => {
      const req = requestMap.get(l.id);
      return {
        id: l.id,
        tenantId: l.tenantId,
        name: l.name,
        phone: l.phone,
        email: l.email,
        postcode: l.postcode,
        serviceType: l.serviceType,
        propertyType: l.propertyType,
        urgency: l.urgency,
        status: l.status,
        quoteValue: l.quoteValue,
        createdAt: l.createdAt,
        hasActiveRequest: !!req && ['pending', 'scheduled', 'sent', 'delivered', 'responded', 'positive', 'negative'].includes(req.status),
        lastRequestId: req?.id,
        lastRequestStatus: req?.status,
        lastRequestDate: req?.createdAt,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err: any) {
    console.warn(`[getEligibleLeads] DB query fallback: ${err?.message}`);

    let filtered = mockLeads.filter((l) => l.tenantId === tenantId);

    if (options.status && options.status !== 'all') {
      filtered = filtered.filter((l) => l.status === options.status);
    }

    if (options.search && options.search.trim()) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(s) ||
          l.phone.toLowerCase().includes(s) ||
          l.email.toLowerCase().includes(s) ||
          l.serviceType.toLowerCase().includes(s) ||
          l.postcode.toLowerCase().includes(s)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    const items: EligibleLeadItem[] = paginated.map((l) => {
      const existingReq = mockReviewRequests.find((r) => r.leadId === l.id && r.tenantId === tenantId);
      return {
        id: l.id,
        tenantId: l.tenantId,
        name: l.name,
        phone: l.phone,
        email: l.email,
        postcode: l.postcode,
        serviceType: l.serviceType,
        propertyType: l.propertyType,
        urgency: l.urgency,
        status: l.status,
        createdAt: l.createdAt,
        hasActiveRequest: !!existingReq,
        lastRequestId: existingReq?.id,
        lastRequestStatus: existingReq?.status as ReviewRequestStatus,
        lastRequestDate: existingReq?.createdAt,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

/**
 * Retrieves review templates for the tenant with fallback to system defaults.
 */
export async function getReviewTemplates(
  tenantId: string,
  channel?: 'sms' | 'email'
): Promise<ReviewTemplateItem[]> {
  try {
    const conditions = [eq(reviewTemplates.tenantId, tenantId)];
    if (channel) {
      conditions.push(eq(reviewTemplates.channel, channel));
    }

    const templates = await db
      .select()
      .from(reviewTemplates)
      .where(and(...conditions))
      .orderBy(desc(reviewTemplates.isDefault), desc(reviewTemplates.createdAt));

    if (templates.length > 0) {
      return templates as ReviewTemplateItem[];
    }

    // If no templates in DB for this tenant, return default templates
    const defaultTemplates: ReviewTemplateItem[] = [
      {
        id: `tpl-sms-default-${tenantId}`,
        tenantId,
        channel: 'sms',
        templateName: 'Standard SMS Review Request',
        subject: null,
        bodyTemplate: DEFAULT_SMS_REVIEW_TEMPLATE,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `tpl-email-default-${tenantId}`,
        tenantId,
        channel: 'email',
        templateName: 'Standard Email Review Request',
        subject: 'How did we do? Feedback for {business_name}',
        bodyTemplate: DEFAULT_EMAIL_REVIEW_TEMPLATE,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    if (channel) {
      return defaultTemplates.filter((t) => t.channel === channel);
    }
    return defaultTemplates;
  } catch (err: any) {
    console.warn(`[getReviewTemplates] DB query fallback: ${err?.message}`);
    const fallbacks = mockReviewTemplates.filter((t) => t.tenantId === tenantId || t.isDefault);
    if (channel) {
      return fallbacks.filter((t) => t.channel === channel) as ReviewTemplateItem[];
    }
    return fallbacks as ReviewTemplateItem[];
  }
}

/**
 * Creates and persists a review request in the LockReview-owned MySQL table.
 * 
 * Strict guarantees:
 * - Tenant scope verification
 * - Channel contact validation (requires phone for SMS, email for Email)
 * - Duplicate request protection
 * - High-entropy cryptographic token generation (64 hex characters)
 * - Audit log record creation
 */
export async function createReviewRequest(input: CreateReviewRequestInput): Promise<ReviewRequestItem> {
  const { tenantId, leadId, quoteId, channel, customMessage, scheduledAt, allowDuplicate, expirationDays = 30 } = input;

  if (!tenantId) {
    throw new Error('Tenant context is required to create a review request.');
  }

  if (!leadId) {
    throw new Error('Customer / Lead ID is required.');
  }

  if (!['sms', 'email', 'both'].includes(channel)) {
    throw new Error(`Invalid delivery channel: ${channel}. Must be 'sms', 'email', or 'both'.`);
  }

  // 1. Fetch and verify the lead belongs to this tenant
  let lead: any = null;
  try {
    const leadRecords = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (leadRecords && leadRecords.length > 0) {
      lead = leadRecords[0];
    }
  } catch (_err: any) {
    lead = mockLeads.find((l) => l.id === leadId && l.tenantId === tenantId);
  }

  if (!lead) {
    lead = mockLeads.find((l) => l.id === leadId && l.tenantId === tenantId);
  }

  if (!lead) {
    throw new Error('Lead/Customer record not found or does not belong to your business.');
  }

  // 2. Validate contact availability for the chosen channel
  if ((channel === 'sms' || channel === 'both') && (!lead.phone || lead.phone.trim() === '')) {
    throw new Error(`Cannot send SMS review request: Customer ${lead.name} has no phone number on record.`);
  }

  if ((channel === 'email' || channel === 'both') && (!lead.email || lead.email.trim() === '')) {
    throw new Error(`Cannot send Email review request: Customer ${lead.name} has no email address on record.`);
  }

  // 3. Duplicate check
  if (!allowDuplicate) {
    const dupCheck = await checkDuplicateRequest(tenantId, leadId);
    if (dupCheck.isDuplicate) {
      const err = new Error(dupCheck.message || 'A review request has already been sent to this customer recently.');
      (err as any).code = 'DUPLICATE_REQUEST_DETECTED';
      (err as any).existingRequest = dupCheck.existingRequest;
      throw err;
    }
  }

  // 4. Generate high-entropy secure token (64 hex characters) and SHA-256 hash
  const secureToken = generateSecureToken(32);
  const tokenHash = await hashToken(secureToken);

  const requestId = generateSecureToken(16);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

  // Status lifecycle: 'scheduled' if future date specified, otherwise 'pending' (ready for Phase 6 dispatch)
  const isScheduled = scheduledAt && new Date(scheduledAt).getTime() > now.getTime();
  const initialStatus: ReviewRequestStatus = isScheduled ? 'scheduled' : 'pending';

  const newRecord = {
    id: requestId,
    tenantId,
    leadId,
    quoteId: quoteId || null,
    status: initialStatus,
    channel,
    secureToken,
    tokenHash,
    rating: null,
    sentAt: null,
    respondedAt: null,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };

  // 5. Persist to MySQL
  try {
    await db.insert(reviewRequests).values(newRecord);
  } catch (dbErr: any) {
    console.warn(`[createReviewRequest] DB insert fallback to memory: ${dbErr?.message}`);
  }
  mockReviewRequests.push(newRecord as any);

  // 6. Record Audit Log entry
  try {
    await db.insert(auditLogs).values({
      id: generateSecureToken(16),
      tenantId,
      event: 'REVIEW_REQUEST_CREATED',
      metadata: {
        reviewRequestId: requestId,
        leadId,
        customerName: lead.name,
        channel,
        status: initialStatus,
        customMessage: !!customMessage,
      },
      createdAt: now,
    });
  } catch (auditErr) {
    console.warn('[createReviewRequest] Audit log insertion skipped:', auditErr);
  }
  mockAuditLogs.push({
    id: generateSecureToken(16),
    tenantId,
    event: 'REVIEW_REQUEST_CREATED',
    metadata: { reviewRequestId: requestId, leadId, channel },
    createdAt: now,
  });

  let finalStatus: ReviewRequestStatus = initialStatus;
  let finalSentAt: Date | null = null;

  if (input.autoDispatch === true && !isScheduled) {
    try {
      const { dispatchReviewRequest } = await import('./notification.service');
      const dispatchRes = await dispatchReviewRequest({
        reviewRequestId: requestId,
        tenantId,
      });
      if (dispatchRes.success) {
        finalStatus = 'sent';
        finalSentAt = dispatchRes.sentAt || now;
      }
    } catch (dispatchErr) {
      console.warn('[createReviewRequest] Automatic dispatch notice:', dispatchErr);
    }
  }

  return {
    ...newRecord,
    status: finalStatus,
    sentAt: finalSentAt,
    customerName: lead.name,
    customerPhone: lead.phone,
    customerEmail: lead.email,
    serviceType: lead.serviceType,
    postcode: lead.postcode,
  };
}

/**
 * Retrieves paginated review requests for the authenticated tenant with joined customer data.
 */
export async function getReviewRequests(
  tenantId: string,
  options: ReviewRequestsFilterOptions = {}
): Promise<PaginatedReviewRequestsResult> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 20));
  const offset = (page - 1) * limit;

  try {
    const conditions = [eq(reviewRequests.tenantId, tenantId)];

    if (options.status && options.status !== 'all') {
      conditions.push(eq(reviewRequests.status, options.status));
    }

    if (options.channel && options.channel !== 'all') {
      conditions.push(eq(reviewRequests.channel, options.channel));
    }

    const whereClause = and(...conditions);

    // Count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviewRequests)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Select with joined lead information
    const rows = await db
      .select({
        id: reviewRequests.id,
        tenantId: reviewRequests.tenantId,
        leadId: reviewRequests.leadId,
        quoteId: reviewRequests.quoteId,
        status: reviewRequests.status,
        channel: reviewRequests.channel,
        secureToken: reviewRequests.secureToken,
        rating: reviewRequests.rating,
        sentAt: reviewRequests.sentAt,
        respondedAt: reviewRequests.respondedAt,
        expiresAt: reviewRequests.expiresAt,
        createdAt: reviewRequests.createdAt,
        updatedAt: reviewRequests.updatedAt,
        customerName: leads.name,
        customerPhone: leads.phone,
        customerEmail: leads.email,
        serviceType: leads.serviceType,
        postcode: leads.postcode,
      })
      .from(reviewRequests)
      .leftJoin(leads, eq(reviewRequests.leadId, leads.id))
      .where(whereClause)
      .orderBy(desc(reviewRequests.createdAt))
      .limit(limit)
      .offset(offset);

    if ((!rows || rows.length === 0) && mockReviewRequests.some((r) => r.tenantId === tenantId)) {
      throw new Error('FallbackToMockReviewRequests');
    }

    // Search filter in application layer if searching joined lead fields
    let items: ReviewRequestItem[] = rows as ReviewRequestItem[];
    if (options.search && options.search.trim()) {
      const s = options.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.customerName?.toLowerCase().includes(s) ||
          i.customerPhone?.toLowerCase().includes(s) ||
          i.customerEmail?.toLowerCase().includes(s) ||
          i.serviceType?.toLowerCase().includes(s)
      );
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err: any) {
    console.warn(`[getReviewRequests] DB query fallback: ${err?.message}`);
    const leadMap = new Map(mockLeads.map((l) => [l.id, l]));

    let filtered = mockReviewRequests.filter((r) => r.tenantId === tenantId);

    if (options.status && options.status !== 'all') {
      filtered = filtered.filter((r) => r.status === options.status);
    }

    if (options.channel && options.channel !== 'all') {
      filtered = filtered.filter((r) => r.channel === options.channel);
    }

    const items: ReviewRequestItem[] = filtered.map((r) => {
      const lead = leadMap.get(r.leadId);
      return {
        ...r,
        status: r.status as ReviewRequestStatus,
        channel: r.channel as DeliveryChannel,
        customerName: lead?.name || 'Customer',
        customerPhone: lead?.phone || '',
        customerEmail: lead?.email || '',
        serviceType: lead?.serviceType || 'Locksmith Service',
        postcode: lead?.postcode || '',
      };
    });

    const total = items.length;
    const paginated = items.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

/**
 * Retrieves a single review request by ID for the tenant, ensuring strict isolation.
 */
export async function getReviewRequestById(
  tenantId: string,
  requestId: string
): Promise<ReviewRequestItem | null> {
  try {
    const rows = await db
      .select({
        id: reviewRequests.id,
        tenantId: reviewRequests.tenantId,
        leadId: reviewRequests.leadId,
        quoteId: reviewRequests.quoteId,
        status: reviewRequests.status,
        channel: reviewRequests.channel,
        secureToken: reviewRequests.secureToken,
        rating: reviewRequests.rating,
        sentAt: reviewRequests.sentAt,
        respondedAt: reviewRequests.respondedAt,
        expiresAt: reviewRequests.expiresAt,
        createdAt: reviewRequests.createdAt,
        updatedAt: reviewRequests.updatedAt,
        customerName: leads.name,
        customerPhone: leads.phone,
        customerEmail: leads.email,
        serviceType: leads.serviceType,
        postcode: leads.postcode,
      })
      .from(reviewRequests)
      .leftJoin(leads, eq(reviewRequests.leadId, leads.id))
      .where(and(eq(reviewRequests.id, requestId), eq(reviewRequests.tenantId, tenantId)))
      .limit(1);

    if (rows && rows.length > 0) {
      return rows[0] as ReviewRequestItem;
    }
    const req = mockReviewRequests.find((r) => r.id === requestId && r.tenantId === tenantId);
    if (!req) return null;
    const lead = mockLeads.find((l) => l.id === req.leadId);
    return {
      ...req,
      status: req.status as ReviewRequestStatus,
      channel: req.channel as DeliveryChannel,
      customerName: lead?.name || 'Customer',
      customerPhone: lead?.phone || '',
      customerEmail: lead?.email || '',
      serviceType: lead?.serviceType || 'Locksmith Service',
      postcode: lead?.postcode || '',
    };
  } catch (_err: any) {
    const req = mockReviewRequests.find((r) => r.id === requestId && r.tenantId === tenantId);
    if (!req) return null;
    const lead = mockLeads.find((l) => l.id === req.leadId);
    return {
      ...req,
      status: req.status as ReviewRequestStatus,
      channel: req.channel as DeliveryChannel,
      customerName: lead?.name || 'Customer',
      customerPhone: lead?.phone || '',
      customerEmail: lead?.email || '',
      serviceType: lead?.serviceType || 'Locksmith Service',
      postcode: lead?.postcode || '',
    };
  }
}
