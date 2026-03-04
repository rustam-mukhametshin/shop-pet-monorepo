const express = require('express');
const path = require('path');
const shopRoutes = express.Router();
const {products} = require('./admin');


shopRoutes.get('/', (req, res) => {
    return res.render('shop', {
        pageTitle: 'Shop page',
        url: '/',
        prods: products
    })
})

module.exports = shopRoutes;
