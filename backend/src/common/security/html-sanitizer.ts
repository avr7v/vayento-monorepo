const DANGEROUS_WITH_CONTENT_RE =
  /<(script|style|iframe|object|embed|template|svg|math)[\s\S]*?>[\s\S]*?<\/\1>/gi;

const DANGEROUS_SINGLE_TAG_RE =
  /<(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option|template|svg|math)[^>]*?>/gi;

const EVENT_HANDLER_RE =
  /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_URL_RE =
  /\s(href|src|xlink:href|formaction)\s*=\s*("|')\s*(javascript:|vbscript:|data:text\/html)[\s\S]*?\2/gi;

const SRC_DOC_RE =
  /\ssrcdoc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

export function sanitizeHtml(input?: string | null) {
  if (!input) return input;

  return input
    .replace(DANGEROUS_WITH_CONTENT_RE, '')
    .replace(DANGEROUS_SINGLE_TAG_RE, '')
    .replace(EVENT_HANDLER_RE, '')
    .replace(DANGEROUS_URL_RE, ' $1="#"')
    .replace(SRC_DOC_RE, '');
}