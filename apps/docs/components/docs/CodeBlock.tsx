'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

export type CodeBlockProps = {
  code: string;
  filename?: string;
  language?: string;
};

type HighlightToken = { text: string; color: string };

function mergeAdjacentTokens(tokens: HighlightToken[]): HighlightToken[] {
  const out: HighlightToken[] = [];
  for (const t of tokens) {
    const last = out[out.length - 1];
    if (last && last.color === t.color) last.text += t.text;
    else out.push({ text: t.text, color: t.color });
  }
  return out;
}

function splitCommentsAndStrings(code: string): { kind: 'comment' | 'string' | 'code'; value: string }[] {
  const segments: { kind: 'comment' | 'string' | 'code'; value: string }[] = [];
  let i = 0;
  const n = code.length;

  while (i < n) {
    if (code[i] === '/' && code[i + 1] === '/') {
      const start = i;
      i += 2;
      while (i < n && code[i] !== '\n') i += 1;
      segments.push({ kind: 'comment', value: code.slice(start, i) });
      continue;
    }
    if (code[i] === '/' && code[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < n - 1 && !(code[i] === '*' && code[i + 1] === '/')) i += 1;
      i = Math.min(i + 2, n);
      segments.push({ kind: 'comment', value: code.slice(start, i) });
      continue;
    }
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      const start = i;
      i += 1;
      while (i < n) {
        if (code[i] === '\\' && i + 1 < n) {
          i += 2;
          continue;
        }
        if (code[i] === quote) {
          i += 1;
          break;
        }
        if (quote === '`' && code[i] === '\n') {
          i += 1;
          continue;
        }
        i += 1;
      }
      segments.push({ kind: 'string', value: code.slice(start, i) });
      continue;
    }
    const start = i;
    i += 1;
    while (i < n) {
      const c = code[i];
      if (c === '/' && (code[i + 1] === '/' || code[i + 1] === '*')) break;
      if (c === '"' || c === "'" || c === '`') break;
      i += 1;
    }
    segments.push({ kind: 'code', value: code.slice(start, i) });
  }

  return segments;
}

function colorizeCodeChunk(chunk: string, isDark: boolean): HighlightToken[] {
  const def = isDark ? '#CDD6F4' : '#1A1F35';
  const tag = isDark ? '#89B4FA' : '#0055FF';
  const prop = isDark ? '#CBA6F7' : '#7C3AED';
  const kw = isDark ? '#F38BA8' : '#C8102E';
  const sym = isDark ? '#FAB387' : '#F07332';

  const tokens: HighlightToken[] = [];
  let i = 0;
  const s = chunk;
  const n = s.length;

  while (i < n) {
    const slice = s.slice(i);

    const mWs = /^[\t\n\f\r ]+/.exec(slice);
    if (mWs) {
      tokens.push({ text: mWs[0], color: def });
      i += mWs[0].length;
      continue;
    }

    if (slice.startsWith('=>')) {
      tokens.push({ text: '=>', color: sym });
      i += 2;
      continue;
    }

    if (slice.startsWith('/>')) {
      tokens.push({ text: '/>', color: tag });
      i += 2;
      continue;
    }

    if (s[i] === '>') {
      tokens.push({ text: '>', color: tag });
      i += 1;
      continue;
    }

    const mKw = /^(import|export|from|const|return)\b/.exec(slice);
    if (mKw) {
      tokens.push({ text: mKw[0], color: kw });
      i += mKw[0].length;
      continue;
    }

    const mTag = /^<\/?[A-Za-z][A-Za-z0-9.]*/.exec(slice);
    if (mTag) {
      tokens.push({ text: mTag[0], color: tag });
      i += mTag[0].length;
      continue;
    }

    const mProp = /^([A-Za-z][A-Za-z0-9]*)(=)(?=['"{])/.exec(slice);
    if (mProp) {
      tokens.push({ text: mProp[1], color: prop });
      tokens.push({ text: '=', color: def });
      i += mProp[1].length + 1;
      continue;
    }

    if ('{}()'.includes(s[i])) {
      tokens.push({ text: s[i], color: sym });
      i += 1;
      continue;
    }

    tokens.push({ text: s[i], color: def });
    i += 1;
  }

  return mergeAdjacentTokens(tokens);
}

function highlightTsxLike(code: string, isDark: boolean): HighlightToken[] {
  const commentC = isDark ? '#585B70' : '#9BA5BE';
  const stringC = isDark ? '#A6E3A1' : '#0A8853';
  const defaultC = isDark ? '#CDD6F4' : '#1A1F35';

  const segments = splitCommentsAndStrings(code);
  const out: HighlightToken[] = [];

  for (const seg of segments) {
    if (seg.kind === 'comment') {
      out.push({ text: seg.value, color: commentC });
    } else if (seg.kind === 'string') {
      out.push({ text: seg.value, color: stringC });
    } else {
      out.push(...colorizeCodeChunk(seg.value, isDark));
    }
  }

  return mergeAdjacentTokens(out);
}

function highlightBashLike(code: string, isDark: boolean): HighlightToken[] {
  const commentC = isDark ? '#585B70' : '#9BA5BE';
  const defaultC = isDark ? '#CDD6F4' : '#1A1F35';
  const out: HighlightToken[] = [];
  let i = 0;
  const n = code.length;

  while (i < n) {
    if (code[i] === '#') {
      let j = i;
      while (j < n && code[j] !== '\n') j += 1;
      out.push({ text: code.slice(i, j), color: commentC });
      i = j;
      continue;
    }
    let j = i;
    while (j < n && code[j] !== '#') j += 1;
    if (j > i) out.push({ text: code.slice(i, j), color: defaultC });
    i = j;
  }

  return mergeAdjacentTokens(out);
}

function highlightCode(code: string, isDark: boolean, language: string): HighlightToken[] {
  const lang = language || 'tsx';
  if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'terminal') {
    return highlightBashLike(code, isDark);
  }
  return highlightTsxLike(code, isDark);
}

function getResolvedIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useLayoutEffect(() => {
    setIsDark(getResolvedIsDark());
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getResolvedIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setIsDark(getResolvedIsDark());
    mq.addEventListener('change', onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onChange);
    };
  }, []);

  return isDark;
}

export function CodeBlock({ code, filename, language = 'tsx' }: CodeBlockProps) {
  const isDark = useIsDark();
  const [copied, setCopied] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);

  const tokens = useMemo(
    () => highlightCode(code, isDark, language),
    [code, isDark, language],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const containerStyle = isDark
    ? {
        background: '#0F1117',
        border: '1px solid #1E2335',
        borderRadius: 12,
        overflow: 'hidden' as const,
      }
    : {
        background: '#F8F9FC',
        border: '1px solid #E2E5EC',
        borderRadius: 12,
        overflow: 'hidden' as const,
      };

  const topBarStyle = isDark
    ? {
        background: '#161B27',
        borderBottom: '1px solid #1E2335',
        padding: '10px 16px',
        display: 'flex' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
      }
    : {
        background: '#F0F2F5',
        borderBottom: '1px solid #E2E5EC',
        padding: '10px 16px',
        display: 'flex' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
      };

  const filenameStyle = isDark
    ? {
        fontSize: 12,
        fontWeight: 500,
        color: '#4A5270',
        fontFamily: 'var(--font-mono), monospace',
      }
    : {
        fontSize: 12,
        fontWeight: 500,
        color: '#6B7694',
        fontFamily: 'var(--font-mono), monospace',
      };

  const codeAreaStyle = isDark
    ? {
        background: '#0F1117',
        padding: '20px 24px',
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
        fontSize: 13,
        lineHeight: 1.7,
        color: '#CDD6F4',
        margin: 0,
        overflowX: 'auto' as const,
      }
    : {
        background: '#F8F9FC',
        padding: '20px 24px',
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
        fontSize: 13,
        lineHeight: 1.7,
        color: '#1A1F35',
        margin: 0,
        overflowX: 'auto' as const,
      };

  const copyBorder = copied ? '#0A8853' : isDark ? '#2E3550' : '#DDE1EA';
  let copyColor = '#6B7694';
  let copyBg: string = 'transparent';
  if (copied) {
    copyColor = '#0A8853';
  } else if (copyHovered) {
    copyColor = isDark ? '#8892A4' : '#2E3550';
    copyBg = isDark ? '#1E2335' : '#E8EBF0';
  } else if (isDark) {
    copyColor = '#4A5270';
  }

  return (
    <div style={containerStyle}>
      <div style={topBarStyle}>
        <span style={filenameStyle}>{filename ?? ''}</span>
        <button
          type="button"
          className={`code-block-copy${copied ? ' code-block-copy--copied' : ''}`}
          style={{
            border: `1px solid ${copyBorder}`,
            borderRadius: 6,
            padding: '5px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: copyColor,
            background: copyBg,
          }}
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          onMouseEnter={() => setCopyHovered(true)}
          onMouseLeave={() => setCopyHovered(false)}
        >
          {copied ? <Check size={16} strokeWidth={2} aria-hidden /> : <Copy size={16} strokeWidth={2} aria-hidden />}
        </button>
      </div>
      <pre style={codeAreaStyle}>
        <code>
          {tokens.map((t, idx) => (
            <span key={idx} style={{ color: t.color }}>
              {t.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
