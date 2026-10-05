import type { Metadata } from 'next';
import './globals.css';
import { ConsumeAuthHash } from '@/components/auth/ConsumeAuthHash';
import { SiteFooterSwitch } from '@/components/site/SiteFooterSwitch';
import { brandDisplayFont } from '@/lib/brand/brand-font';
import { CATALOG_DEFAULT_DESCRIPTION, CATALOG_DEFAULT_TITLE } from '@/lib/catalog-metadata';
import { getMetadataBase } from '@/lib/site-url';
import { BRAND_NAME } from '@/lib/brand/brand-identity';
import { isProLiveRelease } from '@/lib/pro/launch-flags';

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: CATALOG_DEFAULT_TITLE,
  description: CATALOG_DEFAULT_DESCRIPTION,
  openGraph: {
    title: CATALOG_DEFAULT_TITLE,
    description: CATALOG_DEFAULT_DESCRIPTION,
    type: 'website',
    locale: 'en_US',
    siteName: BRAND_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: CATALOG_DEFAULT_TITLE,
    description: CATALOG_DEFAULT_DESCRIPTION,
  },
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
        <ConsumeAuthHash />
        <div className="flex min-h-0 flex-col">{children}</div>
        <SiteFooterSwitch liveRelease={isProLiveRelease()} />
      </body>
    </html>
  );
}