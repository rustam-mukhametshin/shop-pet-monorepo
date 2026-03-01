const express = require('express');
const shopRoutes = express.Router();


shopRoutes.get('/', (req, res, next) => {
    console.log('In another middleware')
    res.send(`
    <h1>Hello from Express!</h1>
    
    <ul>
    <li>
    <a href="/add-product">Add product</a>
</li>
    <li>
    <a href="/product">Product</a>
</li>
</ul>
    
    `)
})

module.exports = shopRoutes;
