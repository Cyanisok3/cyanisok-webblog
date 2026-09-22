'use client';

import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
  status?: 'streaming' | 'stopped' | 'error';
  sources?: Array<{ title: string; url: string }>;
};

type ServerEvent = {
  event: string;
  data: Record<string, unknown>;
};

const MAX_INPUT = 2000;

function parseSseBlock(block: string): ServerEvent | null {
  const lines = block.split('\n');
  const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim() ?? '';
  const dataLine = lines.find((line) => line.startsWith('data:'))?.slice(5).trim();
  if (!event || !dataLine) return null;
  try {
    const data = JSON.parse(dataLine) as Record<string, unknown>;
    return { event, data };
  } catch {
    return null;
  }
}

function trimHistory(messages: ChatMessage[]): Array<{ role: ChatRole; content: string }> {
  const usable = messages
    .filter((message) => message.content.trim() && message.status !== 'error')
    .map(({ role, content }) => ({ role, content }));
  return usable.slice(-20);
}

export function ChatWithMe() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hii~ I'm Cyan (Qingyang Liu, Cyanisok online). Ask me about the site, my work, or just say hi~",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [failedInput, setFailedInput] = useState('');
  const [composing, setComposing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamIndexRef = useRef<number | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = transcriptRef.current;
    if (!node) return;
    const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 120;
    if (nearBottom) node.scrollTop = node.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function updateAssistant(update: (message: ChatMessage) => ChatMessage) {
    const index = streamIndexRef.current;
    if (index === null) return;
    setMessages((current) => current.map((message, messageIndex) => (
      messageIndex === index ? update(message) : message
    )));
  }

  async function sendMessage(event?: { preventDefault: () => void }, retryText?: string) {
    event?.preventDefault();
    const text = (retryText ?? input).trim();
    if (!text || busy) return;
    if (text.length > MAX_INPUT) {
      setStatus(`Please keep this message under ${MAX_INPUT} characters.`);
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: text };
    const assistantMessage: ChatMessage = { role: 'assistant', content: '', status: 'streaming' };
    const history = trimHistory([...messages, userMessage]);
    setMessages((current) => [...current, userMessage, assistantMessage]);
    streamIndexRef.current = messages.length + 1;
    setInput('');
    setFailedInput('');
    setStatus('Connecting…');
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(response.status === 429 ? 'It is a little crowded right now. Please try again soon.' : 'The chat service is temporarily unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() ?? '';
        for (const block of blocks) {
          const parsed = parseSseBlock(block);
          if (!parsed) continue;
          if (parsed.event === 'queued') setStatus('Waiting…');
          if (parsed.event === 'started') setStatus('');
          if (parsed.event === 'delta' && typeof parsed.data.text === 'string') {
            updateAssistant((message) => ({
              ...message,
              content: message.content + parsed.data.text,
            }));
          }
          if (parsed.event === 'sources' && Array.isArray(parsed.data.sources)) {
            updateAssistant((message) => ({
              ...message,
              sources: parsed.data.sources as ChatMessage['sources'],
            }));
          }
          if (parsed.event === 'error') {
            throw new Error(typeof parsed.data.message === 'string' ? parsed.data.message : 'The chat service is temporarily unavailable.');
          }
          if (parsed.event === 'done') setStatus('');
        }
      }
      updateAssistant((message) => ({ ...message, status: undefined }));
    } catch (error) {
      if (controller.signal.aborted) {
        updateAssistant((message) => ({ ...message, status: 'stopped' }));
        setStatus('Stopped');
      } else {
        const message = error instanceof Error ? error.message : 'The chat service is temporarily unavailable.';
        updateAssistant((current) => ({ ...current, content: current.content || message, status: 'error' }));
        setFailedInput(text);
        setStatus('');
      }
    } finally {
      abortRef.current = null;
      streamIndexRef.current = null;
      setBusy(false);
    }
  }

  function stopMessage() {
    abortRef.current?.abort();
  }

  function clearChat() {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setFailedInput('');
    setStatus('');
    setBusy(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !composing) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <section className="chat-interface" aria-labelledby="chat-title">
      <header className="chat-heading">
        <div>
          <p className="chat-kicker">A small conversation</p>
          <h1 id="chat-title">Chat with &quot;me&quot;</h1>
        </div>
        <p className="chat-description">
          Chat with &quot;me&quot; about the site, my public work, or whatever&apos;s on your mind. I only know what&apos;s already public, and this conversation stays on this page.
        </p>
      </header>

      <div className="chat-transcript" ref={transcriptRef} aria-live="polite" aria-label="Conversation">
        {messages.length === 0 && <p className="chat-empty">Start with a casual hello.</p>}
        {messages.map((message, index) => (
          <article className={`chat-message chat-message-${message.role}`} key={`${index}-${message.role}`}>
            <span className="chat-message-label">{message.role === 'user' ? 'You' : 'Cyan'}</span>
            <div className="chat-message-body">
              <p>{message.content || (message.status === 'streaming' ? ' ' : '')}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="chat-sources">
                  <span>Relevant material</span>
                  {message.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>
                  ))}
                </div>
              )}
              {message.status === 'stopped' && <small>Stopped · this reply is incomplete</small>}
              {message.status === 'error' && <small>This reply did not finish</small>}
            </div>
          </article>
        ))}
      </div>

      <form className="chat-composer" onSubmit={(event) => void sendMessage(event)}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          placeholder="Say something…"
          maxLength={MAX_INPUT}
          rows={3}
          disabled={busy}
          aria-label="Message"
        />
        <div className="chat-composer-footer">
          <span>{status || `${input.length} / ${MAX_INPUT}`}</span>
          <div>
            {failedInput && !busy && <button type="button" onClick={() => void sendMessage(undefined, failedInput)}>Retry</button>}
            {busy ? (
              <button type="button" onClick={stopMessage}>Stop</button>
            ) : (
              <button type="submit" disabled={!input.trim()}>Send&nbsp;↗</button>
            )}
            <button type="button" onClick={clearChat}>Clear</button>
          </div>
        </div>
      </form>
      <p className="chat-note">Enter to send · Shift + Enter for a new line · This conversation lives in this page only</p>
    </section>
  );
}
