import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { EmailProvider, EmailSendParams, EmailSendResult, HealthCheckResult } from './EmailProvider';

export class NodemailerProvider implements EmailProvider {
  readonly providerName = 'Hostinger SMTP / Nodemailer';
  private transporter: Transporter | null = null;
  private defaultFrom: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    this.defaultFrom = process.env.SMTP_FROM || process.env.BUSINESS_EMAIL || 'support@atypikalstudio.dev';

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });
      } catch (err) {
        console.warn('[NodemailerProvider] Failed to create transport:', err);
      }
    }
  }

  async sendEmail(params: EmailSendParams): Promise<EmailSendResult> {
    const { to, subject, html, from, replyTo } = params;
    const sender = from || this.defaultFrom;

    if (!this.transporter) {
      console.log(`[NodemailerProvider (Mock/Dev)] To: ${to} | Subject: "${subject}" | From: ${sender}`);
      return {
        success: true,
        id: `smtp-sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        provider: this.providerName,
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: sender,
        to,
        subject,
        html,
        replyTo: replyTo || undefined,
      });

      return {
        success: true,
        id: info.messageId || `smtp-${Date.now()}`,
        provider: this.providerName,
      };
    } catch (err: any) {
      console.error('[NodemailerProvider] SMTP Send failed:', err);
      return {
        success: false,
        error: err.message || 'SMTP delivery failed',
        provider: this.providerName,
      };
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.transporter) {
      return {
        healthy: false,
        provider: this.providerName,
        message: 'SMTP credentials not configured (running in simulation mode).',
      };
    }

    try {
      await this.transporter.verify();
      return {
        healthy: true,
        provider: this.providerName,
        message: 'SMTP server connection verified successfully.',
      };
    } catch (err: any) {
      return {
        healthy: false,
        provider: this.providerName,
        message: `SMTP verification failed: ${err.message}`,
      };
    }
  }
}
