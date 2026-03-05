const express = require('express');
const ProductController = require("../controllers/product.controller");
const shopRoutes = express.Router();


shopRoutes.get('/', ProductController.getProducts)

module.exports = shopRoutes;
