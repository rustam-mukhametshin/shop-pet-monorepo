jest.mock('../../controllers/ai.controller', () => ({
  postGenerateDescription: jest.fn(),
}));

const aiRoutes = require('../../routes/ai.routes.ts').default;

const getRouteMeta = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

describe('ai.routes', () => {
  it('registers the mocked AI generation endpoint', () => {
    const routes = getRouteMeta(aiRoutes);

    expect(routes).toEqual(expect.arrayContaining([
      { path: '/generate-description', methods: ['post'] },
    ]));
  });
});
