const aliases: Record<string, string> = {
  cxx: 'cpp',
  js: 'javascript',
  md: 'markdown',
  py: 'python',
  sh: 'shellscript',
  shell: 'shellscript',
  ts: 'typescript',
  yml: 'yaml',
};

export function resolveCodeLanguage(className: string, available: Record<string, unknown>) {
  const requested = className.match(/language-([\w-]+)/)?.[1] ?? 'text';
  const resolved = aliases[requested] ?? requested;
  return resolved in available ? resolved : 'text';
}
