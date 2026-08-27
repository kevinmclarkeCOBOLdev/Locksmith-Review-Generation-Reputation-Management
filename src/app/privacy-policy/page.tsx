import React from 'react';
import { PrivacyPolicyView } from '@/components/compliance/PrivacyPolicyView';

export const metadata = {
  title: 'Privacy Policy | LockReview Reputation Suite',
  description:
    'UK GDPR and UK Data Protection Act Privacy Policy for the LockReview Locksmith Review Generation & Reputation Management SaaS Platform.',
  openGraph: {
    title: 'Privacy Policy | LockReview Platform',
    description:
      'Information on how personal data is collected, processed, stored, and protected under UK GDPR for review generation.',
    url: 'https://lockreview.atypikalstudio.dev/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
