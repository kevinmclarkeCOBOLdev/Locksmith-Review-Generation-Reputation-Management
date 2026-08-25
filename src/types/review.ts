export type ReviewRequestStatus =
  | 'pending'
  | 'scheduled'
  | 'sent'
  | 'delivered'
  | 'responded'
  | 'positive'
  | 'negative'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type DeliveryChannel = 'sms' | 'email' | 'both';

export type ReviewSentiment = 'positive' | 'negative';

export interface ReviewRequestItem {
  id: string;
  tenantId: string;
  leadId: string;
  quoteId?: string | null;
  status: ReviewRequestStatus;
  channel: DeliveryChannel;
  secureToken: string;
  rating?: number | null;
  sentAt?: Date | string | null;
  respondedAt?: Date | string | null;
  expiresAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
  
  // Joined Lead data
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceType?: string;
  postcode?: string;
}

export interface ReviewFeedbackItem {
  id: string;
  tenantId: string;
  reviewRequestId: string;
  rating: number;
  sentiment: ReviewSentiment;
  feedbackText?: string | null;
  publicPlatformClicked: boolean;
  publicPlatformName?: string | null;
  createdAt: Date | string;
  
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface ReviewPlatformSetting {
  id: string;
  tenantId: string;
  platformName: string;
  destinationUrl: string;
  isEnabled: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface ReviewTemplateItem {
  id: string;
  tenantId: string;
  channel: 'sms' | 'email';
  templateName: string;
  subject?: string | null;
  bodyTemplate: string;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}
