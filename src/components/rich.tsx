import { Fragment, type ReactNode } from 'react';

/**
 * Renders the dictionary's light markup: *text* in italics, ^e^ as a superscript (XVII^e^),
 * and line breaks as <br>.
 */
export function Rich({ text }: { text: string }) {
  return <>{rich(text)}</>;
}

export function rich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*([^*]+)\*|\^([^^]+)\^|\n/g;
  let last = 0;
  let key = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined) out.push(<em key={key++}>{rich(match[1])}</em>);
    else if (match[2] !== undefined)
      out.push(<sup key={key++}>{match[2]}</sup>);
    else out.push(<br key={key++} />);
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.map((part, i) =>
    typeof part === 'string' ? <Fragment key={`t${i}`}>{part}</Fragment> : part,
  );
}

/** The same text without markup, for aria-labels, alt text and metadata. */
export const plain = (text: string) =>
  text.replace(/[*^]/g, '').replace(/\n/g, ' ');

/** Text made safe for markup written as a string. */
export const esc = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** The same light markup as `rich`, as an HTML string (for the menu's pages). */
export const richHtml = (text: string) =>
  esc(text)
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\^([^^]+)\^/g, '<sup>$1</sup>')
    .replace(/\n/g, '<br>');

/** Fills {placeholders} in a dictionary string. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
