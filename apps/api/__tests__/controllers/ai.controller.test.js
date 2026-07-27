const { postGenerateDescription } = require('../../controllers/ai.controller.ts');

const mockReq = (overrides = {}) => ({
  body: {},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

describe('ai.controller', () => {
  describe('postGenerateDescription', () => {
    it('returns a mocked description with the provided title', () => {
      const req = mockReq({
        body: {
          title: 'Dog Food',
        },
      });
      const res = mockRes();

      postGenerateDescription(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        description: 'Mock AI description for "Dog Food".',
      });
    });

    it('returns a generic mocked description when no title is provided', () => {
      const req = mockReq();
      const res = mockRes();

      postGenerateDescription(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        description: 'Mock AI description for a new product.',
      });
    });
  });
});
