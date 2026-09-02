'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className="code-copy" type="button" onClick={copy} aria-label={copied ? 'Code copied' : 'Copy code'}>
      {copied ? <Check aria-hidden="true" strokeWidth={1.5} /> : <Copy aria-hidden="true" strokeWidth={1.5} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
