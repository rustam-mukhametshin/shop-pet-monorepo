import { NextFunction, Request, Response } from 'express'
import { Product } from '../models/product.model'

export async function isUserCreatedProduct(req: Request, res: Response, next: NextFunction) {
  const product_id = req.params.id
  const user_id = req.user.userId

  const product = await Product.findById(product_id).limit(1)

  if (!product) {
    return res.status(401).json({
      status: 'error',
      message: 'Product not found',
    } as ResponseJsonType)
  }

  if (product.userId.toString() !== user_id.toString()) {
    return res.status(401).json({
      status: 'error',
      message: 'User id is not match',
    } as ResponseJsonType)
  }

  return next()
}
