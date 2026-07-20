import type { Metadata } from 'next';
import './globals.css';
import { SiteFooterSwitch } from '@/components/site/SiteFooterSwitch';
import { brandDisplayFont } from '@/lib/brand/brand-font';

export const metadata: Metadata = {
  title: '35mmAi – Filmmaker\'s AI Workspace',
  description: 'Modern cinematic workspace for film prep, look development, and production planning',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${brandDisplayFont.variable}`} data-scroll-behavior="smooth">
      <head>
        <meta
          name="impact-site-verification"
          content="5a6d16e2-b316-4262-83a3-6435044a026e"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-pro-base font-sans text-pro-text">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <SiteFooterSwitch />
      </body>
    </html>
  );
}