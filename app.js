const express = require('express');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const {notFound} = require("./controllers/public.controller");

const app = express();


app.set('view engine', 'ejs');
// app.set('views', 'views');

// Start public
app.use(express.static(path.join(__dirname, 'public')))
// End public

app.use(express.urlencoded({extended: true}));

app.use('/', (req, res, next) => {
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(notFound)

app.listen(3333);
