import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://cyan-field-notes.liuqingyang329.chatgpt.site'),
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
    images: [
      {
        url: 'https://cyan-field-notes.liuqingyang329.chatgpt.site/og.png',
        width: 1200,
        height: 630,
        alt: '微光志 · Cyan Liu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '微光志 · Cyan Liu',
    description: '在城市、旅途与日常之间，记录我看见的光。',
    images: ['https://cyan-field-notes.liuqingyang329.chatgpt.site/og.png'],
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
