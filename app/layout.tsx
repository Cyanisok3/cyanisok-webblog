import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://cyanisok.cn'),
  title: {
    default: '@Cyanisok · Personal Archive',
    template: '%s · @Cyanisok',
  },
  description: 'Writing about systems, agents, research, and ways of seeing.',
  authors: [{ name: 'Cyan Liu' }],
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
