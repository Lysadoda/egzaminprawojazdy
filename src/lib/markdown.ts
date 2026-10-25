// src/lib/markdown.ts
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderSafeMarkdown(rawMarkdown: string | undefined): string {
  if (!rawMarkdown) return '';

  // 1. Convert Markdown to raw HTML
  // We use parse() and assert it as string. marked handles the md syntax.
  const rawHtml = marked.parse(rawMarkdown) as string;

  // 2. Sanitize the HTML (Removes any <script>, onload=, etc.)
  // DOMPurify is the enterprise gold-standard for preventing XSS.
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'blockquote'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
  });

  return safeHtml;
}
