import express from 'express';
import { 
  registerCustomer, 
  registerShopkeeper, 
  loginUser, 
  logoutUser, 
  getMe 
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { 
  registerCustomerSchema, 
  registerShopkeeperSchema, 
  loginSchema 
} from '../schemas/auth.schema';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/register/customer', validate(registerCustomerSchema), registerCustomer);
router.post('/register/shopkeeper', validate(registerShopkeeperSchema), registerShopkeeper);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;
