import React from 'react';
import { TermsOfUseView } from '@/components/compliance/TermsOfUseView';

export const metadata = {
  title: 'Terms of Use | LockReview Reputation Suite',
  description:
    'Terms and conditions governing locksmith review requests, public review routing, private feedback interception, and reputation management services.',
  openGraph: {
    title: 'Terms of Use | LockReview Platform',
    description:
      'Terms and conditions governing locksmith review generation, Google review routing, customer feedback recovery, and single-tenant reputation services.',
    url: 'https://lockreview.atypikalstudio.dev/terms-of-use',
  },
};

export default function TermsOfUsePage() {
  return <TermsOfUseView />;
}
