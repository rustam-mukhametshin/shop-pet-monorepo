const express = require('express');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use('/', (req, res, next) => {
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
    console.log('300')
    return res
        .status(404)
        .send(`<h1>Not found</h1>`)
})

app.listen(3000);
