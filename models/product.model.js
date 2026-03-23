const Cart = require("./cart.model");
const db = require("../util/database");

module.exports = class Product {
    static #tableName = "products";

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

    static #getAllProducts() {
        return db.execute(`
            SELECT *
            FROM ${this.#tableName}
        `);
    }

    save() {
        Product.#getAllProducts().then(([products]) => {
            if (this.id) {
                const productIndex = products.findIndex(product => product.id === this.id);
                const updatedProducts = [
                    ...products,
                ]
                updatedProducts[productIndex] = this;
                // fs.writeFile(p, JSON.stringify(updatedProducts), e => {
                //     console.log(e);
                // });
            } else {
                this.id = Math.random().toString();
                products.push(this);
                // fs.writeFile(p, JSON.stringify(products), e => {
                //     console.log(e);
                // });
            }
        });
    }

    static getAll() {
        return db.execute(`
            SELECT *
            FROM ${this.#tableName}
        `).then(([rows]) => rows);
    }

    static findById(id) {
        return db.execute(
            `
                SELECT *
                FROM ${this.#tableName}
                WHERE id = ?
                LIMIT 1
            `,
            [id]
        ).then(([rows]) => rows[0]);
    }

    static delete(id, cb) {
        return this.#getAllProducts().then(([products]) => {
            const product = products.find(p => p.id === id);
            if (id) {
                fs.writeFile(p, JSON.stringify(products.filter(product => product.id !== id)), err => {

                    if (!err) {
                        Cart.deleteProduct(id, product.price);
                    } else {
                        console.error(err);
                    }
                });
            }
            return cb();
        });
    }
}