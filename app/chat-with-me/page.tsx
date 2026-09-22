import type { Metadata } from 'next';
import { InnerNavigation } from '@/components/inner-navigation';
import { ChatWithMe } from '@/components/chat-with-me';
import './chat-with-me.css';

const description = 'Chat with "me" — drop by and say hi to Cyan (Qingyang Liu, also known as Cyanisok): the site, my work, films, or whatever comes up.';

export const metadata: Metadata = {
  title: 'Chat With Me',
  description,
  alternates: { canonical: '/chat-with-me' },
  openGraph: {
    type: 'website',
    url: 'https://cyanisok.cn/chat-with-me',
    title: 'Chat With Me · @Cyanisok',
    description,
  },
};

export default function ChatWithMePage() {
  return (
    <main className="inner-page chat-page">
      <div className="inner-shell chat-shell">
        <InnerNavigation active={null} label="Chat navigation" />
        <ChatWithMe />
      </div>
    </main>
  );
}
