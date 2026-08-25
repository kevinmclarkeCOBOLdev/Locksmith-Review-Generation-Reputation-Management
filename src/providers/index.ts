import { EmailProvider } from './email/EmailProvider';
import { ResendProvider } from './email/ResendProvider';
import { NodemailerProvider } from './email/NodemailerProvider';
import { SMSProvider, DefaultSMSProvider, defaultSMSProvider } from './sms/SMSProvider';

export * from './email/EmailProvider';
export * from './email/ResendProvider';
export * from './email/NodemailerProvider';
export * from './sms/SMSProvider';

let cachedEmailProvider: EmailProvider | null = null;
let cachedSMSProvider: SMSProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cachedEmailProvider) {
    return cachedEmailProvider;
  }

  // Priority: Resend if API key is present -> otherwise Nodemailer (SMTP)
  if (process.env.RESEND_API_KEY) {
    cachedEmailProvider = new ResendProvider();
  } else {
    cachedEmailProvider = new NodemailerProvider();
  }

  return cachedEmailProvider;
}

export function getSMSProvider(): SMSProvider {
  if (cachedSMSProvider) {
    return cachedSMSProvider;
  }

  cachedSMSProvider = defaultSMSProvider || new DefaultSMSProvider();
  return cachedSMSProvider;
}
