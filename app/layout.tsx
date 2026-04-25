import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '35mmAI – Cinematic Gear Planner',
  description: 'Professional production tool for film & photography',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="impact-site-verification"
          content="5a6d16e2-b316-4262-83a3-6435044a026e"
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-sans">{children}</body>
    </html>
  );
}