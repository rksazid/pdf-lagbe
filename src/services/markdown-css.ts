/** GitHub-style Markdown CSS + highlight.js GitHub theme, scoped to .markdown-body */
export const MARKDOWN_CSS = `
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #24292f;
  word-wrap: break-word;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3,
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}
.markdown-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
.markdown-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1em; }

.markdown-body p { margin: 0 0 1em; }
.markdown-body a { color: #0969da; text-decoration: none; }
.markdown-body strong { font-weight: 600; }
.markdown-body em { font-style: italic; }
.markdown-body del { text-decoration: line-through; }

.markdown-body img { max-width: 100%; height: auto; border-radius: 6px; }
.markdown-body hr { height: 0.25em; margin: 1.5em 0; background-color: #d1d9e0; border: 0; border-radius: 2px; }

/* Lists */
.markdown-body ul, .markdown-body ol { padding-left: 2em; margin: 0 0 1em; }
.markdown-body li { margin: 0.25em 0; }
.markdown-body li + li { margin-top: 0.25em; }

/* Task lists */
.markdown-body .contains-task-list { list-style: none; padding-left: 0; }
.markdown-body .task-list-item { position: relative; padding-left: 1.5em; }
.markdown-body .task-list-item input[type="checkbox"] {
  position: absolute; left: 0; top: 0.3em;
  margin: 0; pointer-events: none;
}

/* Blockquote */
.markdown-body blockquote {
  margin: 0 0 1em;
  padding: 0 1em;
  color: #656d76;
  border-left: 0.25em solid #d1d9e0;
}

/* Tables */
.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin: 0 0 1em;
}
.markdown-body th, .markdown-body td {
  padding: 6px 13px;
  border: 1px solid #d1d9e0;
}
.markdown-body th {
  font-weight: 600;
  background-color: #f6f8fa;
}
.markdown-body tr:nth-child(2n) { background-color: #f6f8fa; }

/* Code */
.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 6px;
}
.markdown-body pre {
  margin: 0 0 1em;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
}
.markdown-body pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 100%;
}

/* highlight.js GitHub theme */
.hljs { color: #24292e; background: #f6f8fa; }
.hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #d73a49; }
.hljs-literal, .hljs-number, .hljs-variable, .hljs-template-variable, .hljs-tag .hljs-attr { color: #005cc5; }
.hljs-string, .hljs-doctag { color: #032f62; }
.hljs-title, .hljs-section, .hljs-selector-id { color: #6f42c1; }
.hljs-type, .hljs-class .hljs-title { color: #6f42c1; }
.hljs-symbol, .hljs-bullet { color: #e36209; }
.hljs-meta { color: #005cc5; }
.hljs-attr { color: #005cc5; }
.hljs-built_in, .hljs-builtin-name { color: #005cc5; }
.hljs-deletion { color: #24292e; background-color: #ffeef0; }
.hljs-addition { color: #22863a; background-color: #f0fff4; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
`;
