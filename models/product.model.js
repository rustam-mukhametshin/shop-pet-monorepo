const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
);

const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return cb([]);
        }
        return cb(JSON.parse(fileContent));
    });
}

module.exports = class Product {
    constructor(
        id,
        title,
        imageUrl,
        description,
        price = 0,
    ) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const productIndex = products.findIndex(product => product.id === this.id);
                const updatedProducts = [
                    ...products,
                ]
                updatedProducts[productIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), e => {
                    console.log(e);
                });
            } else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), e => {
                    console.log(e);
                });
            }
        });
    }

    static getAll(cb) {
        return getProductsFromFile(cb);
    }

    static findById(cb, id) {
        return getProductsFromFile(products => {
            cb(products.find(p => p.id === id));
        });
    }
}