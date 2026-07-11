import {NextFunction, Request, Response} from 'express';
import {Product} from '../models/product.model';
import {UserModel} from "../models/user.model";
import {OrderModel} from "../models/order.model";
import * as fs from "node:fs";
import path from "path";
import PDFDocument from "pdfkit";
import {validationResult} from "express-validator";
import {ObjectId} from "mongodb";

// const stripe = new Stripe(process.env.STRIPE_SECRET!);

const ITEMS_PER_PAGE = 10;

export const getIndex = async (req: Request, res: Response, next: NextFunction) => {
  return getProducts(req, res, next);
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  const currentPage: number = parseInt(req.query?.page as string) || 1;
  const totalNumberOfPages = await Product.countDocuments();
  const lastPage = Math.ceil(totalNumberOfPages / 2);

  return Product
    .find()
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .populate('userId')
    .then((products) => {
      return res.json({
        prods: products,
        currentPage,
        lastPage,
      });
    })
    .catch((err: any) => next(new Error(err)));
};

export const getProduct = (req: Request, res: Response, next: NextFunction) => {
  return Product.findById(req.params['id'] as string)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }

      return res.json({
        product,
      });
    })
    .catch((err: any) => next(new Error(err)));
};

export const getCart = (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
  return UserModel.findById(req?.user).populate({
    path: 'cart.items.productId',
    model: 'Product',
  })
    .select('cart')
    .then((user: any) => {
      if (user && user.cart) {
        return res.json({
          cart: user.cart,
          products: user.cart.items,
        });
      } else {
        return res.status(404).json({
          cart: {},
          products: [],
        });
      }
    })
    .catch((err: any) => next(new Error(err)));
};

export const postAddProductToCart = (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const productId = req.body.id as string;
  return Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }

      // Todo: refactor
      // @ts-ignore
      return req?.user?.addToCart(product).then(() => res.json({
        product,
      }));
    })
    .catch((err: any) => next(new Error(err)));
};

export const postCartDeleteProduct = (req: Request, res: Response, next: NextFunction) => {
  return req.user
    // Todo: refactor
    // @ts-ignore
    .deleteProductFromCart(req.params['id'])
    .then((result: unknown) => res.json({
      product: result,
    }))
    .catch((err: any) => next(new Error(err)));
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  return OrderModel
    .find({
      'userId': req?.user.userId
    })
    .populate({
      path: 'products.product',
      model: 'Product',
    })
    .then((orders: any[]) => {
      return res.json({
        orders: orders,
      });
    })
    .catch((err: any) => next(new Error(err)));
};

export const postDeleteOrderItem = (req: Request, res: Response, next: NextFunction) => {
  const {productId, orderId} = req.body as { productId: string; orderId: string };
  return req.user
    // Todo: refactor
    // @ts-ignore
    .deleteProductFromOrder(productId, orderId)
    .then((result: unknown) => res.json({
      product: result,
    }))
    .catch((err: any) => next(new Error(err)));
};

export let getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.orderId;

  OrderModel.findById(orderId)
    .populate({
      path: 'products.product',
      model: 'Product',
    })
    .then(order => {
      if (!order) {
        return next(new Error('Not Found'));
      }

      if (order.userId.toString() !== req.user.userId.toString()) {
        return next(new Error('Unauthorized'));
      }

      const pdfDoc = new PDFDocument();
      const invoice = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('private', 'invoices', invoice);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoice + '"');
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res)

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach((prod: any) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.text(prod.product.title + ' - ' + prod.quantity + ' x $' + prod.product.price);
      })
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
      pdfDoc.end();

      // fs.readFile(invoicePath, (err, data) => {
      //     if (err) {
      //         console.error(err);
      //         return next(err);
      //     }
      //

      //     return res.send(data);
      // })
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoice + '"');
      // todo: check bigger files
      // file.pipe(res);

    })
    .catch((err: any) => next(new Error(err)));

};

export let getCheckout = async (req: Request, res: Response, next: NextFunction) => {
  return UserModel.findById(req?.user).populate({
    path: 'cart.items.productId',
    model: 'Product',
  })
    .select('cart')
    .then(async (user: any) => {
      if (!user || !user.cart || user.cart.items.length === 0) {
        return res.json({
          cart: {},
          error: 'Empty cart item',
        });
      }

      const products = user.cart.items;

      // const session = await stripe.checkout.sessions.create({
      //     payment_method_types: ['card'],
      //     line_items: products.map((p: any) => ({
      //         price_data: {
      //             currency: 'usd',
      //             unit_amount: Math.round(p.productId.price * 100),
      //             product_data: {
      //                 name: p.productId.title,
      //                 description: p.productId.description,
      //             },
      //         },
      //         quantity: p.quantity,
      //     })),
      //     mode: 'payment',
      //     success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
      //     cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      // });

      // return res.redirect(303, session.url || '/cart');
      return res.redirect(303, '/cart');
    })
    .catch((err: any) => next(new Error(err)));
};

export let getCheckoutSuccess = async (req: Request, res: Response, next: NextFunction) => {
  return UserModel.findById(req?.user).populate({
    path: 'cart.items.productId',
    model: 'Product',
  })
    .select('cart')
    .then(async (user: any) => {
      const orders = await OrderModel.find().cursor().toArray();
      if (!user || !user.cart) {
        return res.json({
          orders: orders,
        });
      }

      const order = new OrderModel({
        products: user.cart.items.map((item: any) => ({
          quantity: item.quantity,
          product: item.productId,
        })),
        userId: req.user.userId,
      });

      await order.save();
      // Todo: refactor
      // @ts-ignore
      await req.user.clearCart();

      return res.json({
        orders: orders,
      });
    })
    .catch((err: any) => next(new Error(err)));
};

export const postAddProduct = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      edit: false,
      product: undefined,
      errorMessage: errors.array(),
    });
  }

  const image = req.file;
  const {title, description, price} = req.body as {
    title: string;
    description: string;
    price: string;
  };

  if (!image) {
    return res.status(422).json({
      edit: false,
      product: undefined,
      errorMessage: 'Attached file is not an image',
    });
  }

  const imageUrl = image.path;

  try {
    const product = await new Product({
      title,
      imageUrl,
      description,
      price: parseFloat(price),
      userId: req.user,
    })
      .save();
    return res.json(product.toObject())
  } catch (err: unknown) {
    next(new Error(err as string));
  }
};

/**
 * Delete single product
 *
 * @param req
 * @param res
 * @param next
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  const productId = req.params['id'] as string;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    } as ResponseJsonType)
  }

  return Product.deleteOne({
    _id: new ObjectId(product._id),
  })
    .then(result => {
      return res.status(200).json({
        status: 'success',
        message: 'Successfully deleted product',
        data: result,
      } as ResponseJsonType)
    })
    .catch((err: any) => {
      return next(new Error(err))
    });
}