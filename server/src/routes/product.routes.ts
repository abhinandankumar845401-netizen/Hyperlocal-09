import express from 'express';
import { getProductsByShop, createProduct } from '../controllers/product.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/shop/:shopId', protect, getProductsByShop);
router.post('/', protect, authorize('shopkeeper'), createProduct);

export default router;
