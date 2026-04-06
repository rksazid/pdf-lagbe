export function simpleMarkdown(): string {
  return '# Hello World\n\nThis is a **test** document with *emphasis*.\n\n## Section Two\n\nA paragraph with a [link](https://example.com).';
}

export function gfmMarkdown(): string {
  return `## GFM Features

| Name | Value | Status |
|------|-------|--------|
| Item A | 100 | Done |
| Item B | 200 | Pending |

- [x] Task complete
- [ ] Task pending

~~strikethrough text~~

> This is a blockquote with **bold** inside.`;
}

export function codeBlockMarkdown(): string {
  return `# Code Examples

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

Inline code: \`const x = 1;\`
`;
}

export function fullDocumentMarkdown(): string {
  return `# Project Report

## Overview

This is a **comprehensive** document with *various* markdown features.

> Important note: This is a blockquote.

### Features

1. Ordered list item
2. Another item
   - Nested bullet
   - Another nested

| Column A | Column B | Column C |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

\`\`\`typescript
interface Report {
  title: string;
  date: Date;
}
\`\`\`

---

End of document.`;
}
