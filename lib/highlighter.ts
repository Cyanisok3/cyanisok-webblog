import { bundledLanguages, createHighlighter, type Highlighter } from 'shiki/bundle/full';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Shiki's default Oniguruma engine relies on WebAssembly, which is disallowed
// inside the Cloudflare Worker runtime. The pure-JavaScript regex engine needs
// no WASM and supports the languages used here, so we run a single cached
// highlighter and load grammars lazily on first use.
const THEME = 'github-light';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  if (!code || lang === 'text' || !(lang in bundledLanguages)) return '';

  const highlighter = await getHighlighter();
  const loaded = highlighter.getLoadedLanguages();
  if (!loaded.includes(lang)) {
    await highlighter.loadLanguage(lang as never);
  }

  return highlighter.codeToHtml(code, {
    lang,
    theme: THEME,
    structure: 'inline',
  });
}
