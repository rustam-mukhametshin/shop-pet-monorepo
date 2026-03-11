const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = {
                products: [],
                totalPrice: 0,
            }
            if (!err) {
                if (fileContent.length > 0) {
                    cart = JSON.parse(fileContent);
                }
            }

            const existingProductIndex = cart.products.findIndex((item) => item.id === id);
            const existingProduct = cart.products[existingProductIndex];

            let updatedProduct;
            if (existingProduct) {
                updatedProduct = {
                    ...existingProduct,
                    quantity: existingProduct.quantity + 1,
                }
                cart.products = [...cart.products]
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = {
                    id,
                    quantity: 1,
                }
                cart.products = [...cart.products, updatedProduct];
            }

            cart.totalPrice += parseFloat(productPrice) || 0;

            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            })
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = {
                products: [],
                totalPrice: 0,
            }
            if (!err) {
                if (fileContent.length > 0) {
                    cart = JSON.parse(fileContent);
                }
            }


            const updatedCart = {
                ...cart
            }
            const product = updatedCart.products.find((item) => item.id === id);
            const productQty = product.quantity;
            updatedCart.products = updatedCart.products.filter((item) => item.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            })
        })
    }

    static getCart(cb){
        fs.readFile(p, (err, fileContent) => {
            let cart = {
                products: [],
                totalPrice: 0,
            }
            if (!err) {
                if (fileContent.length > 0) {
                    cart = JSON.parse(fileContent);
                }
            }

            cb(cart);
        })

    }
}