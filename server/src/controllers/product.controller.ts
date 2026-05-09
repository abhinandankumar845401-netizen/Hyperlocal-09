import type { Request, Response } from 'express';
import Product from '../models/Product';
import Shop from '../models/Shop';

export const getProductsByShop = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ shopId: req.params.shopId });
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({ userId: (req as any).user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found for this user' });
    }

    const product = await Product.create({
      ...req.body,
      shopId: shop._id,
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
