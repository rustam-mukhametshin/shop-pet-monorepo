const express = require('express');

const adminRoutes = express.Router();


adminRoutes.get('/add-product', (req, res, next) => {
    return res
        .send(`
            <form action="/admin/product" method="post">
                <input type="text" name="title" />
                <button type="submit">Add product</button>
            </form>
    `)
})

adminRoutes.post('/product', (req, res, next) => {
    res.redirect('/');
})


module.exports = adminRoutes;