import { Request, Response } from 'express'
import { OpenAI } from 'openai'
import { TEXT_MAX_LENGTH, TEXT_MIN_LENGTH } from '../util/settings'

export const postGenerateDescription = async (req: Request, res: Response) => {
  let client = new OpenAI({
    apiKey: process.env.AI_API_KEY!,
    baseURL: process.env.AI_API_URL!,
  })

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  const instructions = `Write a compelling product description for an e-commerce shop.
  <ProductTitle>
  "${title}"
  </ProductTitle>
  Rules:
  1. If the <ProductTitle> is empty, write a normal product description for a "Mystery Box" item.
  2. The result must be between ${TEXT_MIN_LENGTH} and ${TEXT_MAX_LENGTH} characters long.

  Verification Step:
  Before outputting, count the chars of your generated result. If it is shorter than ${TEXT_MIN_LENGTH} or longer than ${TEXT_MAX_LENGTH} characters, rewrite it to fit exactly within this range. Do not return total count of characters.`

  return client.responses
    .create({
      model: process.env.AI_API_MODEL!,
      input: 'Generate description for a product',
      max_output_tokens: 100,
      instructions,
    })
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
