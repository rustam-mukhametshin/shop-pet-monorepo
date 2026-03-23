const express = require('express');
const ShopController = require("../controllers/shop.controller");
const shopRoutes = express.Router();


shopRoutes.get('/products', ShopController.getProducts)
shopRoutes.get('/products/:id', ShopController.getProduct)

shopRoutes.get('/cart', ShopController.getCart)
shopRoutes.post('/cart', ShopController.postCart)

shopRoutes.get('/cart-delete-item/:id', ShopController.deleteItem)

shopRoutes.get('/checkout', ShopController.getCheckout)
shopRoutes.get('/orders', ShopController.getOrders)

shopRoutes.get('/', ShopController.getIndex)

module.exports = shopRoutes;
