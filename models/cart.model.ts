import fs from 'fs';
import path from 'path';
import {
    DataTypes,
    Model,
    Optional,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyAddAssociationMixin,
} from 'sequelize';
import sequelize from '../util/database';
import type Product from './product.model';

// ── Sequelize model ─────────────────────────────────────────────────────────

export interface CartAttributes {
    id: number;
    products: CartItem[];
    totalPrice: number;
    userId?: number | null;
}

interface CartCreationAttributes
    extends Optional<CartAttributes, 'id' | 'products' | 'totalPrice'> {}

export interface CartItem {
    id: string | number;
    quantity: number;
}

export interface CartData {
    products: CartItem[];
    totalPrice: number;

    getProducts?(): any;
}

export type CartProductWithThrough = Product & {
    cartItem: {
        quantity: number;
        destroy: () => Promise<unknown>;
    };
};

export interface CartWithProducts
    extends Model<CartAttributes, CartCreationAttributes> {
    getCartProducts: BelongsToManyGetAssociationsMixin<Product>;
    addCartProduct: BelongsToManyAddAssociationMixin<Product, number>;
}

export const Cart = sequelize.define<CartWithProducts>(
    'cart',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        products: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        totalPrice: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
        },
    }
);

// ── File-based helpers ───────────────────────────────────────────────────────

const DEFAULT_CART: CartData = {
    products: [],
    totalPrice: 0,
};

const cartFilePath = path.join(
    path.dirname(require.main?.filename ?? process.argv[1]),
    'data',
    'cart.json'
);

// ── CartModel class ──────────────────────────────────────────────────────────

export class CartModel {
    /** Add (or increment) a product in the user's cart row via Sequelize. */
    static addProduct(
        productId: string | number,
        userId: string | number,
        product: { price: number | string }
    ): Promise<Model<CartAttributes>> {
        return Cart.findOne({ where: { userId } })
            .then((cart) => ({
                cart,
                productPrice: product.price,
            }))
            .then(({ cart, productPrice }) => {
                let isUpdate = false;
                let cartData: CartData = cart
                    ? (cart.get({ plain: true }) as unknown as CartData)
                    : { ...DEFAULT_CART };

                const existingIndex = cartData.products.findIndex(
                    (item) => item.id === productId
                );
                const existingProduct = cartData.products[existingIndex];

                let updatedProducts: CartItem[];

                if (existingProduct) {
                    isUpdate = true;
                    const updated: CartItem = {
                        ...existingProduct,
                        quantity: existingProduct.quantity + 1,
                    };
                    updatedProducts = [...cartData.products];
                    updatedProducts[existingIndex] = updated;
                } else {
                    isUpdate = false;
                    updatedProducts = [
                        ...cartData.products,
                        { id: productId, quantity: 1 },
                    ];
                }

                const newTotalPrice =
                    cartData.totalPrice + (parseFloat(String(productPrice)) || 0);

                if (isUpdate && cart) {
                    return (cart as any).update({
                        products: updatedProducts,
                        totalPrice: newTotalPrice,
                    }) as Promise<Model<CartAttributes>>;
                }

                return Cart.create({
                    products: updatedProducts,
                    totalPrice: newTotalPrice,
                    userId: userId as number,
                } as CartCreationAttributes) as unknown as Promise<Model<CartAttributes>>;
            });
    }

    /** Remove a product from the file-based cart. */
    static deleteProduct(id: string | number, productPrice: number): void {
        fs.readFile(cartFilePath, (err, fileContent) => {
            let cart: CartData = { products: [], totalPrice: 0 };

            if (!err && fileContent.length > 0) {
                cart = JSON.parse(fileContent.toString()) as CartData;
            }

            const product = cart.products.find((item) => item.id === id);
            if (!product) return;

            const productQty = product.quantity;
            const updatedCart: CartData = {
                ...cart,
                products: cart.products.filter((item) => item.id !== id),
                totalPrice: cart.totalPrice - productPrice * productQty,
            };

            fs.writeFile(cartFilePath, JSON.stringify(updatedCart), (writeErr) => {
                if (writeErr) console.error(writeErr);
            });
        });
    }

    /** Read cart from the JSON file. */
    static getCart(cb: (cart: CartData) => void): void {
        fs.readFile(cartFilePath, (err, fileContent) => {
            let cart: CartData = { products: [], totalPrice: 0 };

            if (!err && fileContent.length > 0) {
                cart = JSON.parse(fileContent.toString()) as CartData;
            }

            cb(cart);
        });
    }
}
