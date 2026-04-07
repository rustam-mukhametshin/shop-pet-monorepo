import {Router} from 'express';
import * as ShopController from '../controllers/shop.controller';

const shopRoutes = Router();

shopRoutes.get('/products', ShopController.getProducts);
shopRoutes.get('/products/:id', ShopController.getProduct);

shopRoutes.get('/cart', ShopController.getCart);
shopRoutes.post('/cart', ShopController.postCart);

shopRoutes.get('/cart-delete-item/:id', ShopController.postCartDeleteProduct);

shopRoutes.get('/orders', ShopController.getOrders);
shopRoutes.post('/create-order', ShopController.postCreateOrder);
shopRoutes.post('/order-delete-item', ShopController.postDeleteOrderItem);

shopRoutes.get('/', ShopController.getIndex);

export default shopRoutes;

