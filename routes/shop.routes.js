const express = require('express');
const ShopController = require("../controllers/shop.controller");
const shopRoutes = express.Router();


shopRoutes.get('/products', ShopController.getProducts)
shopRoutes.get('/products/:id', ShopController.getProductDetails)
shopRoutes.get('/cart', ShopController.getCart)
shopRoutes.get('/checkout', ShopController.getCheckout)
shopRoutes.get('/orders', ShopController.getOrders)

shopRoutes.get('/', ShopController.getIndex)

module.exports = shopRoutes;
