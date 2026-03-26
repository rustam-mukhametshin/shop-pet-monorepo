const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Cart = sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    products: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
    },
    totalPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
});

const DEFAULT_CART = {
    products: [],
    totalPrice: 0,
};

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

class CartModel {
    static addProduct(productId, userId, product) {
        return Cart.findOne({where: {userId}})
            .then(cart => ({
                cart,
                productPrice: product.price,
            }))
            .then(({cart, productPrice}) => {
                let isUpdate = false;

                if (!cart) {
                    cart = Object.assign({}, DEFAULT_CART)
                }

                const existingProductIndex = cart.products.findIndex((item) => item.id === productId);
                const existingProduct = cart.products[existingProductIndex];

                let updatedProduct;
                if (existingProduct) {
                    isUpdate = true;
                    updatedProduct = {
                        ...existingProduct,
                        quantity: existingProduct.quantity + 1,
                    }
                    cart.products = [...cart.products]
                    cart.products[existingProductIndex] = updatedProduct;
                } else {
                    isUpdate = false;
                    updatedProduct = {
                        id: productId,
                        quantity: 1,
                    }
                    cart.products = [...cart.products, updatedProduct];
                }

                cart.totalPrice += parseFloat(productPrice) || 0;

                if(isUpdate) {
                    cart.update({
                        products: cart.products,
                        totalPrice: cart.totalPrice,
                        userId, // TODO REMOVE
                    })
                } else {
                    return Cart.create({
                        products: cart.products,
                        totalPrice: cart.totalPrice,
                        userId,
                    })
                }
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

            if (!product) {
                return;
            }

            const productQty = product.quantity;
            updatedCart.products = updatedCart.products.filter((item) => item.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            })
        })
    }

    static getCart(cb) {
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

module.exports = {CartModel, Cart};