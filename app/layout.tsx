import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/scaffold/layout/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Internal Tools Demo (build-vs-buy evaluation)',
  description: 'Local-only prototype with fake seeded data. Not for production use.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
