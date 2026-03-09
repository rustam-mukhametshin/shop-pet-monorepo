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
        title,
        imageUrl,
        description,
        price = 0,
    ) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        this.id = Math.random().toString()
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), e => {
                console.log(e);
            });
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