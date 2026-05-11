import {Router} from 'express';
import * as ShopController from '../controllers/shop.controller';
import {isAuth} from "../middleware/is-auth";

const shopRoutes = Router();

shopRoutes.get('/products', ShopController.getProducts);
shopRoutes.get('/products/:id', ShopController.getProduct);

shopRoutes.get('/cart', isAuth, ShopController.getCart);
shopRoutes.post('/cart', isAuth, ShopController.postAddProductToCart);

shopRoutes.get('/cart-delete-item/:id', isAuth, ShopController.postCartDeleteProduct);

shopRoutes.get('/orders', isAuth, ShopController.getOrders);
shopRoutes.post('/create-order', isAuth, ShopController.postCreateOrder);
shopRoutes.post('/order-delete-item', isAuth, ShopController.postDeleteOrderItem);

shopRoutes.get('/invoices/:orderId', isAuth, ShopController.getInvoice);

shopRoutes.get('/', ShopController.getIndex);

export default shopRoutes;

