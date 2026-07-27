import { Router } from 'express'
import * as ShopController from '../controllers/shop.controller'
import { isAuth } from '../middleware/is-auth'
import { body } from 'express-validator'
import { TEXT_MAX_LENGTH, TEXT_MIN_LENGTH, TITLE_MAX_LENGTH } from '../util/settings'

const shopRoutes = Router()
/**
 *  GET
 */
shopRoutes.get('/products', ShopController.getProducts) // PUBLIC
shopRoutes.get('/products/:id', ShopController.getProduct) // PUBLIC
shopRoutes.get('/cart', isAuth, ShopController.getCart)
shopRoutes.get('/cart-delete-item/:id', isAuth, ShopController.postCartDeleteProduct)
shopRoutes.get('/checkout', isAuth, ShopController.getCheckout)
shopRoutes.get('/checkout/success', isAuth, ShopController.getCheckoutSuccess)
shopRoutes.get('/orders', isAuth, ShopController.getOrders)
shopRoutes.get('/invoices/:orderId', isAuth, ShopController.getInvoice)
/**
 *  POST
 */
shopRoutes.post(
  '/add-product',
  isAuth,
  [
    body('title', 'Only alphanumeric characters for title')
      .isString()
      .escape()
      .isLength({ min: TEXT_MIN_LENGTH, max: TITLE_MAX_LENGTH })
      .trim(),
    body('price').escape().isFloat(),
    body(
      'description',
      `Only alphanumeric characters for description. Min ${TEXT_MIN_LENGTH}, max ${TEXT_MAX_LENGTH}`
    )
      .isString()
      .escape()
      .isLength({ min: TEXT_MIN_LENGTH, max: TEXT_MAX_LENGTH })
      .trim(),
  ],
  ShopController.postAddProduct
)
shopRoutes.post('/cart', isAuth, ShopController.postAddProductToCart)
// shopRoutes.post('/create-order', isAuth, ShopController.postCreateOrder);
shopRoutes.post('/order-delete-item', isAuth, ShopController.postDeleteOrderItem)

/**
 *  PATCH
 */
shopRoutes.patch(
  '/products/:id',
  isAuth,
  [body('title').isString().trim().isLength({ min: TEXT_MIN_LENGTH, max: TITLE_MAX_LENGTH })],
  ShopController.patchProduct
)

/**
 *  DELETE
 */
shopRoutes.delete('/products/:id', isAuth, ShopController.deleteProduct)

/**
 * DEFAULT HOME PAGE
 */
shopRoutes.get('/', ShopController.getIndex)

export default shopRoutes
