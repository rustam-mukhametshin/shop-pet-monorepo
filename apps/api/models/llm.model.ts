import { OpenAI } from 'openai'
import { TEXT_MAX_LENGTH, TEXT_MIN_LENGTH } from '../util/settings'
import { generateImage } from 'ai'
import { xai } from '@ai-sdk/xai'
import fs from 'node:fs/promises'

export const generateDescription = (title: string) => {
  let client = new OpenAI({
    apiKey: process.env.AI_API_KEY!,
    baseURL: process.env.AI_API_URL!,
  })

  const instructions = `Write a compelling product description for an e-commerce shop.
  <ProductTitle>
  "${title}"
  </ProductTitle>
  Rules:
  1. If the <ProductTitle> is empty, write a normal product description for a "Mystery Box" item.
  2. The result must be between ${TEXT_MIN_LENGTH} and ${TEXT_MAX_LENGTH} characters long.

  Verification Step:
  Before outputting, count the chars of your generated result. If it is shorter than ${TEXT_MIN_LENGTH} or longer than ${TEXT_MAX_LENGTH} characters, rewrite it to fit exactly within this range. Do not return total count of characters.`

  return client.responses.create({
    model: process.env.AI_API_MODEL!,
    input: 'Generate description for a product',
    max_output_tokens: 100,
    instructions,
  })
}

export const generateDynamicPrompt = async (
  title: string,
  description: string
): Promise<string> => {
  const client = new OpenAI({
    apiKey: process.env.AI_API_KEY!,
    baseURL: process.env.AI_API_URL!,
  })

  // 36 tokens
  const instructions = `Create a minimalist e-commerce product photo prompt based on title + description.
Rule: Output ONLY the prompt (max 30 words). No intro, explanation, or quotes.
Format: Studio product photography of [Product] based on title + description, centered, [fitting color] minimalist solid background, clean, studio lighting, sharp focus.`

  try {
    const response = await client.responses.create({
      model: process.env.AI_API_MODEL!,
      input: `Title: "${title}"\nDescription: "${description}"`,
      max_output_tokens: 45,
      instructions,
    })

    return response.output_text.trim() // Only prompt
  } catch (e: unknown) {
    console.error('Failed to generate dynamic prompt:', e)
    throw e
  }
}

export const generateImageCustom = async (title: string, description: string) => {
  try {
    const dynamicPrompt = await generateDynamicPrompt(title, description)
    const generatedImage = await generateImage({
      model: xai.image('grok-imagine-image-quality'),
      prompt: dynamicPrompt,
      n: 1,
      aspectRatio: '1:1',
      providerOptions: { xai: { resolution: '1k' } },
      headers: {
        authorization: 'Bearer ' + process.env.XAI_API_KEY!,
      },
    })

    const file = generatedImage.images[0].base64
    const fileName = `generated_${Date.now()}.png`
    await fs.writeFile(`./public/images/${fileName}`, Buffer.from(file, 'base64'))

    return {
      fileName,
    }
  } catch (error) {
    console.error('Failed to generate image:', error)
    throw error
  }
}
