const { notFound } = require('../../controllers/public.controller.ts');

const mockReq = (overrides = {}) => ({
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
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

    it('returns not-found json payload', () => {
      const req = mockReq();
      const res = mockRes();

      notFound(req, res, () => {});

      expect(res.json).toHaveBeenCalledWith({
        error: 'Not Found',
      });
    });
  });
});
