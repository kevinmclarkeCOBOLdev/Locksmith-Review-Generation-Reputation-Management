import React from 'react';
import { TermsOfUseView } from '@/components/compliance/TermsOfUseView';

export const metadata = {
  title: 'Terms of Use | LockReview Reputation Suite',
  description:
    'Terms and conditions governing locksmith review requests, public review routing, private feedback interception, and reputation management services.',
};

export default function DashboardTermsOfUsePage() {
  return <TermsOfUseView />;
}
