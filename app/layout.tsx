import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '35mmAI – Cinematic Gear Planner',
  description: 'Professional production tool for film & photography',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-sans">{children}</body>
    </html>
  );
}