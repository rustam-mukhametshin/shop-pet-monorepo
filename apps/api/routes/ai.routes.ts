import {Router} from 'express';
import {body} from 'express-validator';
import * as AiController from '../controllers/ai.controller';

const aiRoutes = Router();

aiRoutes.post(
  '/generate-description',
  [
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({max: 100}),
  ],
  AiController.postGenerateDescription,
);

export default aiRoutes;
