import { Request, Response } from 'express'
import { generateDescription, generateImageCustom } from '../models/llm.model'
import { validationResult } from 'express-validator'

export const postGenerateDescription = async (req: Request, res: Response) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''

  return generateDescription(title)
    .then((response) => {
      return res.status(200).json({
        status: 'success',
        message: 'Successfully generated description',
        data: response.output_text.trim(),
      } as ResponseJsonType)
    })
    .catch((error) => {
      console.error('Error generating description:', error)
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while generating the description.',
      } as ResponseJsonType)
    })
}

export const postGenerateImage = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      edit: false,
      product: undefined,
      errorMessage: errors.array(),
    })
  }

  const { title, description } = req.body

  await generateImageCustom(title, description)
    .then((value) => {
      return res.status(200).json({
        status: 'success',
        message: 'Successfully generated image',
        data: {
          text: value,
        },
      })
    })
    .catch((error) => {
      console.error('Error generating image:', error)
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while generating the image.',
      })
    })
}
