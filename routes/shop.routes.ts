import { Router } from 'express';
import * as ShopController from '../controllers/shop.controller';

const shopRoutes = Router();

shopRoutes.get('/products', ShopController.getProducts);
shopRoutes.get('/products/:id', ShopController.getProduct);

shopRoutes.get('/cart', ShopController.getCart);
shopRoutes.post('/cart', ShopController.postCart);

shopRoutes.get('/cart-delete-item/:id', ShopController.deleteItem);

shopRoutes.get('/checkout', ShopController.getCheckout);
shopRoutes.get('/orders', ShopController.getOrders);

shopRoutes.get('/', ShopController.getIndex);

export default shopRoutes;

