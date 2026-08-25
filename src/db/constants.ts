export const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || '00000000-0000-0000-0000-000000000000';

export const DEFAULT_SMS_REVIEW_TEMPLATE =
  'Hi {customer_name}, thank you for choosing {business_name}! Could you take 30 seconds to share how we did? {review_link}';

export const DEFAULT_EMAIL_REVIEW_TEMPLATE = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #1e293b;">
  <h2 style="color: #0f172a; margin-bottom: 12px;">How did we do?</h2>
  <p style="font-size: 15px; line-height: 1.6; color: #475569;">
    Hi {customer_name},
  </p>
  <p style="font-size: 15px; line-height: 1.6; color: #475569;">
    Thank you for trusting <strong>{business_name}</strong> for your locksmith service. Customer satisfaction is our highest priority, and your feedback helps us continually improve.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{review_link}" style="background-color: #E76A0E; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 16px;">
      Leave Your Feedback
    </a>
  </div>
  <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px;">
    It takes less than 30 seconds. Thank you for your support!
  </p>
</div>
`.trim();

export const DEFAULT_REVIEW_PLATFORMS = [
  {
    platformName: 'google',
    destinationUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    isEnabled: true,
  },
  {
    platformName: 'trustpilot',
    destinationUrl: 'https://uk.trustpilot.com/evaluate/atypikalstudio.dev',
    isEnabled: false,
  },
  {
    platformName: 'checkatrade',
    destinationUrl: 'https://www.checkatrade.com/trades/atypikallocksmiths',
    isEnabled: false,
  }
];
