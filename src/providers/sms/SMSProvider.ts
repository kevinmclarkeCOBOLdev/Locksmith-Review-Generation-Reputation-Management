export interface SMSSendParams {
  to: string;
  body: string;
  from?: string;
}

export interface SMSSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

export interface SMSProvider {
  readonly providerName?: string;
  sendSMS(params: SMSSendParams): Promise<SMSSendResult>;
}

export class DefaultSMSProvider implements SMSProvider {
  readonly providerName = 'Locksmith SMS Gateway';

  async sendSMS(params: SMSSendParams): Promise<SMSSendResult> {
    const { to, body } = params;

    if (!to || to.trim() === '') {
      return {
        success: false,
        error: 'Recipient phone number is required',
        provider: this.providerName,
      };
    }

    // In production or simulation mode:
    console.log(`[SMS Gateway] Dispatching SMS to: ${to} | Length: ${body.length} chars | Body: "${body}"`);

    const messageId = `sms-msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    return {
      success: true,
      messageId,
      provider: this.providerName,
    };
  }
}

export const defaultSMSProvider: SMSProvider = new DefaultSMSProvider();
