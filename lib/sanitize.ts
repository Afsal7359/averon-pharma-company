/**
 * Allow-list sanitiser for the admin rich-text editor.
 *
 * Deliberately string-based rather than DOM-based: it has to run in the browser
 * (before saving) *and* on the server (before rendering), and Node has no
 * DOMParser. Anything not explicitly permitted is dropped, so a tag added to
 * the editor later must be added here too or it will silently vanish.
 *
 * Only admins can write this HTML, but it is stored in the database and echoed
 * into a public page, so it is sanitised on the way out as well as on the way
 * in — a compromised admin account should not become stored XSS.
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 's',
  'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'blockquote', 'a',
]);

/** Tags whose entire contents must go, not just the tag itself. */
const VOID_THE_CONTENTS = /<(script|style|iframe|object|embed|noscript)\b[\s\S]*?<\/\1\s*>/gi;

const TAG = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const HREF = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

/** Only these can appear in an href — blocks javascript: and data: payloads. */
function safeHref(raw: string): string | null {
  const value = raw.trim();

  // Test against a decoded, whitespace-free copy: "java<TAB>script:" and
  // "java&#115;cript:" both still reach the browser as javascript:.
  const probe = value
    .replace(/&#x([0-9a-f]+);?/gi, (_m, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_m, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/[\s\u0000-\u001F\u007F]/g, '')
    .toLowerCase();

  if (/^(https?:|mailto:|tel:)/.test(probe)) return value;
  // Site-relative links are fine; protocol-relative (//evil.com) is not.
  if (probe.startsWith('/') && !probe.startsWith('//')) return value;
  if (probe.startsWith('#')) return value;
  return null;
}

function escapeAttr(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';

  // Strip dangerous elements wholesale first, so their text content cannot
  // survive as visible page copy once the tags themselves are removed.
  let html = String(input).replace(VOID_THE_CONTENTS, '');
  // Unclosed <script ...> with no matching end tag.
  html = html.replace(/<(script|style|iframe|object|embed|noscript)\b[^>]*>/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  const openTags: string[] = [];

  html = html.replace(TAG, (match: string, rawName: string, rawAttrs: string) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return '';

    if (match.startsWith('</')) {
      // Drop stray closers that never had an opener.
      const i = openTags.lastIndexOf(name);
      if (i === -1) return '';
      openTags.splice(i, 1);
      return `</${name}>`;
    }

    if (name === 'br') return '<br>';

    // Every attribute is dropped except a validated href on <a>.
    if (name === 'a') {
      const found = rawAttrs.match(HREF);
      const href = found ? safeHref(found[1] ?? found[2] ?? found[3] ?? '') : null;
      if (!href) return '';
      openTags.push(name);
      // Only off-site links open in a new tab.
      const external = /^(https?:|mailto:|tel:)/i.test(href.trim());
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escapeAttr(href)}"${attrs}>`;
    }

    openTags.push(name);
    return `<${name}>`;
  });

  // Close anything the editor left hanging, innermost first.
  while (openTags.length) html += `</${openTags.pop()}>`;

  return html.trim();
}

/** True when the HTML carries no visible content — used to hide empty sections. */
export function isBlankHtml(input: string | null | undefined): boolean {
  if (!input) return true;
  return !sanitizeHtml(input)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

/** Plain text for meta descriptions and previews. */
export function htmlToText(input: string | null | undefined): string {
  return sanitizeHtml(input)
    .replace(/<\/(p|h2|h3|h4|li|blockquote)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
