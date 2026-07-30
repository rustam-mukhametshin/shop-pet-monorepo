import { Router } from 'express'
import { body } from 'express-validator'
import * as AiController from '../controllers/ai.controller'
import { TEXT_MAX_LENGTH, TITLE_MAX_LENGTH } from '../util/settings'

const aiRoutes = Router()

aiRoutes.post(
  '/generate-description',
  [body('title').optional().isString().trim().isLength({ max: TITLE_MAX_LENGTH })],
  AiController.postGenerateDescription
)

aiRoutes.post(
  '/generate-image',
  [
    body('title').isString().trim().isLength({ max: TITLE_MAX_LENGTH }),
    body('description').isString().trim().isLength({ max: TEXT_MAX_LENGTH }),
  ],
  AiController.postGenerateImage
)

export default aiRoutes
