import { Resend } from 'resend';
import { EmailProvider, EmailSendParams, EmailSendResult, HealthCheckResult } from './EmailProvider';

export class ResendProvider implements EmailProvider {
  readonly providerName = 'Resend';
  private resend: Resend | null = null;
  private defaultFrom: string;

  constructor(apiKey?: string, defaultFrom?: string) {
    const key = apiKey || process.env.RESEND_API_KEY;
    this.defaultFrom =
      defaultFrom || process.env.RESEND_FROM_EMAIL || 'Locksmith Reviews <reviews@atypikalstudio.dev>';

    if (key) {
      try {
        this.resend = new Resend(key);
      } catch (err) {
        console.warn('[ResendProvider] Initialization notice:', err);
      }
    }
  }

  async sendEmail(params: EmailSendParams): Promise<EmailSendResult> {
    const { to, subject, html, from, replyTo } = params;
    const sender = from || this.defaultFrom;

    if (!this.resend) {
      console.log(`[ResendProvider (Mock/Dev)] To: ${to} | Subject: "${subject}" | From: ${sender}`);
      return {
        success: true,
        id: `resend-sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        provider: this.providerName,
      };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: sender,
        to: [to],
        subject,
        html,
        replyTo: replyTo || undefined,
      });

      if (error) {
        console.error('[ResendProvider] Send error:', error);
        return {
          success: false,
          error: error.message || 'Resend delivery failed',
          provider: this.providerName,
        };
      }

      return {
        success: true,
        id: data?.id || `resend-${Date.now()}`,
        provider: this.providerName,
      };
    } catch (err: any) {
      console.error('[ResendProvider] Exception during send:', err);
      return {
        success: false,
        error: err.message || 'Unknown Resend error occurred',
        provider: this.providerName,
      };
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const hasKey = !!(process.env.RESEND_API_KEY || this.resend);
    return {
      healthy: hasKey,
      provider: this.providerName,
      message: hasKey ? 'Resend API key is configured.' : 'Resend API key missing (running in simulation mode).',
    };
  }
}
