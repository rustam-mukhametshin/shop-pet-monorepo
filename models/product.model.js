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

    static create(title, imageUrl, description, price = 0) {
        return db.execute(
            `
                INSERT INTO ${this.#tableName} (title, imageUrl, description, price)
                VALUES (?, ?, ?, ?)
            `,
            [title, imageUrl, description, price]
        );
    }

    static update(id, title, imageUrl, description, price = 0) {
        return db.execute(
            `
                UPDATE ${this.#tableName}
                SET title = ?, imageUrl = ?, description = ?, price = ?
                WHERE id = ?
            `,
            [title, imageUrl, description, price, id]
        );
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