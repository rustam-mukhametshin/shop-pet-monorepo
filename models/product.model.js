const fs = require('fs');
const path = require('path');

module.exports = class Product {
    constructor(
        title = '',
    ) {
        this.title = title;
    }

    save() {
        const p = Product.#getFilePath();
        fs.readFile(p, (err, fileContent) => {
            debugger
            let products = [];
            if (!err) {
                products = JSON.parse(fileContent) || [];
                products.push(this);
            }
            fs.writeFile(p, JSON.stringify(products), e => {
                console.log(e);
            });
        });
    }

    static getAll(cb) {
        fs.readFile(this.#getFilePath(), (err, fileContent) => {
            if (err) {
                cb([]);
            }
            cb(JSON.parse(fileContent));
        });
    }

    static #getFilePath() {
        return path.join(
            path.dirname(process.mainModule.filename),
            'data',
            'products.json'
        )
    }
}