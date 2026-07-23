import {Router} from 'express';
import * as ShopController from '../controllers/shop.controller';
import {isAuth} from "../middleware/is-auth";
import {body} from "express-validator";

const shopRoutes = Router();
/**
 *  GET
 */
shopRoutes.get('/products', ShopController.getProducts);
shopRoutes.get('/products/:id', ShopController.getProduct);
shopRoutes.get('/cart', isAuth, ShopController.getCart);
shopRoutes.get('/cart-delete-item/:id', isAuth, ShopController.postCartDeleteProduct);
shopRoutes.get('/checkout', isAuth, ShopController.getCheckout);
shopRoutes.get('/checkout/success', isAuth, ShopController.getCheckoutSuccess);
shopRoutes.get('/orders', isAuth, ShopController.getOrders);
shopRoutes.get('/invoices/:orderId', isAuth, ShopController.getInvoice);
/**
 *  POST
 */
shopRoutes.post(
  '/add-product',
  [
    body('title', 'Only alphanumeric characters for title')
      .isString()
      .escape()
      .isLength({min: 1, max: 100})
      .trim(),
    body('price')
      .escape()
      .isFloat(),
    body('description', 'Only alphanumeric characters for description')
      .isString()
      .escape()
      .isLength({min: 1, max: 200})
      .trim(),
  ],
  ShopController.postAddProduct
);
shopRoutes.post('/cart', isAuth, ShopController.postAddProductToCart);
// shopRoutes.post('/create-order', isAuth, ShopController.postCreateOrder);
shopRoutes.post('/order-delete-item', isAuth, ShopController.postDeleteOrderItem);

/**
 *  PATCH
 */
shopRoutes.patch(
  '/products/:id',
  [
    body('title')
      .isString()
      .trim()
      .isLength({min: 1, max: 100}),
  ],
  ShopController.patchProduct
);

/**
 *  DELETE
 */
shopRoutes.delete('/products/:id', ShopController.deleteProduct)

/**
 * DEFAULT HOME PAGE
 */
shopRoutes.get('/', ShopController.getIndex);

export default shopRoutes;
