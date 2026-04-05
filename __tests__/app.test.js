const app = require('../app.ts').default;

describe('app.ts', () => {
  test('returns 404 for an unknown route', async () => {
    const server = app.listen(0);

    try {
      const { port } = server.address();
      const response = await fetch(`http://127.0.0.1:${port}/__jest_missing_route__`);
      const html = await response.text();

      expect(response.status).toBe(404);
      expect(html).toContain('Page Not Found!');
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});


