import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';

const siteIcon = '/PINTR.svg?v=20261027';

export const metadata: Metadata = {
  metadataBase: new URL('https://cyanisok.cn'),
  title: 'Qingyang Liu | 刘清扬',
  description: 'Writing about systems, agents, research, and ways of seeing.',
  authors: [{ name: 'Cyan Liu' }],
  icons: {
    icon: { url: siteIcon, type: 'image/svg+xml' },
    shortcut: siteIcon,
  },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://cyanisok.cn',
    title: '@Cyanisok · Personal Archive',
    description: 'Writing about systems, agents, research, and ways of seeing.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: '@Cyanisok · Personal Archive',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '@Cyanisok · Personal Archive',
    description: 'Writing about systems, agents, research, and ways of seeing.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
