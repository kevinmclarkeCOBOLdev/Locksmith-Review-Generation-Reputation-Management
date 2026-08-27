import React from 'react';
import { PrivacyPolicyView } from '@/components/compliance/PrivacyPolicyView';

export const metadata = {
  title: 'Privacy Policy | LockReview Reputation Suite',
  description:
    'UK GDPR and UK Data Protection Act Privacy Policy for the LockReview Locksmith Review Generation & Reputation Management SaaS Platform.',
};

export default function DashboardPrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
