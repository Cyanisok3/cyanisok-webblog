import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://cyan-field-notes.liuqingyang329.chatgpt.site'),
  title: {
    default: '@Cyanisok · Personal Archive',
    template: '%s · @Cyanisok',
  },
  description: 'Writing about systems, agents, research, and ways of seeing.',
  authors: [{ name: 'Cyan Liu' }],
  openGraph: {
    type: 'website',
    title: '@Cyanisok · Personal Archive',
    description: 'Writing about systems, agents, research, and ways of seeing.',
    images: [
      {
        url: 'https://cyan-field-notes.liuqingyang329.chatgpt.site/og.png',
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
    images: ['https://cyan-field-notes.liuqingyang329.chatgpt.site/og.png'],
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
