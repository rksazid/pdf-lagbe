export function simpleDocument(): string {
  return `
    <html>
      <head><title>Test</title></head>
      <body>
        <h1>Hello World</h1>
        <p>This is a test document.</p>
        <table>
          <thead><tr><th>Name</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Item 1</td><td>100</td></tr>
            <tr><td>Item 2</td><td>200</td></tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
}

export function styledDocument(): string {
  return `
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: sans-serif; padding: 2rem; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .flex-row { display: flex; justify-content: space-between; align-items: center; }
          h1 { color: #333; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <h1>Styled Report</h1>
        <div class="grid">
          <div class="card"><div class="flex-row"><span>Revenue</span><strong>$12,345</strong></div></div>
          <div class="card"><div class="flex-row"><span>Users</span><strong>1,234</strong></div></div>
          <div class="card"><div class="flex-row"><span>Orders</span><strong>567</strong></div></div>
          <div class="card"><div class="flex-row"><span>Growth</span><strong>+23%</strong></div></div>
        </div>
      </body>
    </html>
  `;
}

export function jsDocument(): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 2rem; }
          #dynamic { color: blue; font-size: 24px; }
        </style>
      </head>
      <body>
        <h1 id="title">Original Title</h1>
        <div id="dynamic"></div>
        <script>
          document.getElementById('title').textContent = 'Modified by JavaScript';
          document.getElementById('dynamic').textContent = 'This was added by JS at ' + new Date().toISOString();
        </script>
      </body>
    </html>
  `;
}

export function canvasDocument(): string {
  return `
    <html>
      <body>
        <canvas id="chart" width="400" height="300"></canvas>
        <script>
          const canvas = document.getElementById('chart');
          const ctx = canvas.getContext('2d');

          // Draw a simple bar chart
          const data = [120, 200, 150, 80, 180];
          const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
          const barWidth = 60;
          const gap = 15;

          data.forEach((value, i) => {
            ctx.fillStyle = colors[i];
            const x = i * (barWidth + gap) + 30;
            const height = value;
            const y = 280 - height;
            ctx.fillRect(x, y, barWidth, height);
          });

          ctx.fillStyle = '#333';
          ctx.font = '16px sans-serif';
          ctx.fillText('Simple Bar Chart', 100, 20);
        </script>
      </body>
    </html>
  `;
}

export function cdnStylesheetDocument(): string {
  return `
    <html>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap">
        <style>
          body { font-family: 'Roboto', sans-serif; padding: 2rem; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>CDN Font Test</h1>
        <p>This text should use the Roboto font loaded from Google Fonts CDN.</p>
      </body>
    </html>
  `;
}

export function svgDocument(): string {
  return `
    <html>
      <body>
        <svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#36A2EB" opacity="0.8"/>
          <text x="100" y="105" text-anchor="middle" fill="white" font-size="20">SVG</text>
        </svg>
      </body>
    </html>
  `;
}
