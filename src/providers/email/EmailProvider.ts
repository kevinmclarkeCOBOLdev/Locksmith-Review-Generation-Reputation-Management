export interface EmailSendParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailTemplateParams {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  from?: string;
  replyTo?: string;
}

export interface EmailBulkParams {
  emails: EmailSendParams[];
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  provider?: string;
}

export interface HealthCheckResult {
  healthy: boolean;
  provider: string;
  message?: string;
  details?: Record<string, any>;
}

/**
 * Provider-independent Email Interface for LockReview & LockQuote product ecosystem.
 */
export interface EmailProvider {
  readonly providerName?: string;
  sendEmail(params: EmailSendParams): Promise<EmailSendResult>;
  sendTemplate?(params: EmailTemplateParams): Promise<EmailSendResult>;
  healthCheck(): Promise<HealthCheckResult>;
}
