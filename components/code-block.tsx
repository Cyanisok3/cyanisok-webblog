import { Children, isValidElement, type ComponentProps, type ReactNode } from 'react';
import { bundledLanguages } from 'shiki/bundle/full';
import { CodeCopyButton } from '@/components/code-copy-button';
import { resolveCodeLanguage } from '@/lib/code-language';
import { highlightCode } from '@/lib/highlighter';

function textContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join('');
  if (isValidElement(node)) return textContent((node.props as { children?: ReactNode }).children);
  return '';
}

export async function CodeBlock({ children, ...props }: ComponentProps<'pre'>) {
  const codeElement = Children.toArray(children).find(isValidElement);
  const codeProps = isValidElement(codeElement)
    ? (codeElement.props as { children?: ReactNode; className?: string })
    : {};
  const code = textContent(codeProps.children ?? children).replace(/(?:\r?\n)+$/, '');
  const className = codeProps.className ?? '';
  const language = resolveCodeLanguage(className, bundledLanguages);

  let html = '';
  try {
    html = await highlightCode(code, language);
  } catch {
    html = '';
  }

  return (
    <div className="code-block">
      <CodeCopyButton code={code} />
      <pre {...props}>
        {html ? (
          <code className={className} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code className={className}>{code}</code>
        )}
      </pre>
    </div>
  );
}
