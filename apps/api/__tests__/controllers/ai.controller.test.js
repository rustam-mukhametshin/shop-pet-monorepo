const mockGenerateDescription = jest.fn();
const mockGenerateImageCustom = jest.fn();

jest.mock('../../models/llm.model.ts', () => ({
  generateDescription: (...args) => mockGenerateDescription(...args),
  generateImageCustom: (...args) => mockGenerateImageCustom(...args),
}));

const { postGenerateDescription, postGenerateImage } = require('../../controllers/ai.controller.ts');

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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('postGenerateDescription', () => {
    it('returns generated description data with the provided title', async () => {
      mockGenerateDescription.mockResolvedValue({
        output_text: 'Mock AI description for "Dog Food".',
      });
      const req = mockReq({
        body: {
          title: 'Dog Food',
        },
      });
      const res = mockRes();

      await postGenerateDescription(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockGenerateDescription).toHaveBeenCalledWith('Dog Food');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Successfully generated description',
        data: 'Mock AI description for "Dog Food".',
      });
    });

    it('returns a generic generated description when no title is provided', async () => {
      mockGenerateDescription.mockResolvedValue({
        output_text: 'Mock AI description for a new product.',
      });
      const req = mockReq();
      const res = mockRes();

      await postGenerateDescription(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockGenerateDescription).toHaveBeenCalledWith('');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Successfully generated description',
        data: 'Mock AI description for a new product.',
      });
    });

    it('returns 500 when description generation fails', async () => {
      mockGenerateDescription.mockRejectedValue(new Error('boom'));
      const req = mockReq({ body: { title: 'Dog Food' } });
      const res = mockRes();

      await postGenerateDescription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'An error occurred while generating the description.',
      });
    });
  });

  describe('postGenerateImage', () => {
    it('returns generated image data', async () => {
      mockGenerateImageCustom.mockResolvedValue({
        fileName: 'generated.png',
      });
      const req = mockReq({
        body: {
          title: 'Dog Food',
          description: 'Tasty food',
        },
      });
      const res = mockRes();

      await postGenerateImage(req, res);

      expect(mockGenerateImageCustom).toHaveBeenCalledWith('Dog Food', 'Tasty food');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Successfully generated image',
        data: {
          text: {
            fileName: 'generated.png',
          },
        },
      });
    });

    it('returns 500 when image generation fails', async () => {
      mockGenerateImageCustom.mockRejectedValue(new Error('boom'));
      const req = mockReq({
        body: {
          title: 'Dog Food',
          description: 'Tasty food',
        },
      });
      const res = mockRes();

      await postGenerateImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'An error occurred while generating the image.',
      });
    });
  });
});
