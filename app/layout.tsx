import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '微光志 · Cyan Liu',
    template: '%s · 微光志',
  },
  description: '在城市、旅途与日常之间，记录我看见的光。',
  authors: [{ name: 'Cyan Liu' }],
  openGraph: {
    type: 'website',
    title: '微光志 · Cyan Liu',
    description: '在城市、旅途与日常之间，记录我看见的光。',
  },
  twitter: {
    card: 'summary',
    title: '微光志 · Cyan Liu',
    description: '在城市、旅途与日常之间，记录我看见的光。',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
