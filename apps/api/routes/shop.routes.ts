import {Router} from 'express';
import * as ShopController from '../controllers/shop.controller';
import {isAuth} from "../middleware/is-auth";

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
shopRoutes.post('/cart', isAuth, ShopController.postAddProductToCart);
// shopRoutes.post('/create-order', isAuth, ShopController.postCreateOrder);
shopRoutes.post('/order-delete-item', isAuth, ShopController.postDeleteOrderItem);

/**
 * DEFAULT HOME PAGE
 */
shopRoutes.get('/', ShopController.getIndex);

export default shopRoutes;

