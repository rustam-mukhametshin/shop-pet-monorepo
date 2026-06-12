const { notFound } = require('../../controllers/public.controller.ts');

const mockReq = (overrides = {}) => ({
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.render = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

describe('public.controller', () => {
  describe('notFound', () => {
    it('responds with status 404', () => {
      const req = mockReq();
      const res = mockRes();

      notFound(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('renders the 404 view with page metadata', () => {
      const req = mockReq();
      const res = mockRes();

      notFound(req, res, () => {});

      expect(res.render).toHaveBeenCalledWith('404', expect.objectContaining({
        pageTitle: 'Not Found',
        url: '404',
      }));
    });
  });
});

