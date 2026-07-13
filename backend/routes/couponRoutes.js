import express from 'express';
import {
  validateCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
  getLatestActiveCoupon,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/latest-active', getLatestActiveCoupon);
router.post('/validate', protect, validateCoupon);
router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);
router.route('/:id')
  .delete(protect, admin, deleteCoupon);

export default router;
