const express = require('express');
const path = require('path');
const shopRoutes = express.Router();
const {products} = require('./admin');


shopRoutes.get('/', (req, res) => {
    console.log(products);
    res.render('shop', {
        pageTitle: 'Shop page',
        prods: products
    })
})

module.exports = shopRoutes;
