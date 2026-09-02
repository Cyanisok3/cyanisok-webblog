import { Children, isValidElement, type ComponentProps, type ReactNode } from 'react';
import { bundledLanguages, codeToHtml } from 'shiki/bundle/full';
import { CodeCopyButton } from '@/components/code-copy-button';
import { resolveCodeLanguage } from '@/lib/code-language';

function textContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join('');
  if (isValidElement(node)) return textContent((node.props as { children?: ReactNode }).children);
  return '';
}

export async function CodeBlock({ children, ...props }: ComponentProps<'pre'>) {
  const codeElement = Children.toArray(children).find(isValidElement);
  const codeProps = isValidElement(codeElement)
    ? codeElement.props as { children?: ReactNode; className?: string; 'data-title'?: string }
    : {};
  const code = textContent(codeProps.children ?? children).replace(/(?:\r?\n)+$/, '');
  const className = codeProps.className ?? '';
  const title = codeProps['data-title'];
  const language = resolveCodeLanguage(className, bundledLanguages);

  let html = '';
  try {
    html = await codeToHtml(code, {
      lang: language as keyof typeof bundledLanguages,
      theme: 'github-dark-default',
      structure: 'inline',
    });
  } catch {
    html = '';
  }

  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>{title ?? language}</span>
        <CodeCopyButton code={code} />
      </div>
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
