import express from 'express';
import {
  getNearbyShops,
  getShopById,
  createShop,
  updateShop,
  getMyShop,
} from '../controllers/shop.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/nearby', getNearbyShops);                                   // Public
router.get('/my', protect, getMyShop);                                   // Shopkeeper only
router.post('/', protect, authorize('shopkeeper', 'admin'), createShop); // Shopkeeper only
router.put('/:id', protect, authorize('shopkeeper', 'admin'), updateShop);
router.get('/:id', getShopById);                                         // Public

export default router;
