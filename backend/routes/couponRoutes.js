import express from 'express';
import {
  validateCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
  getLatestActiveCoupon,
  generateBugReward,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/latest-active', getLatestActiveCoupon);
router.post('/validate', protect, validateCoupon);
router.post('/generate-bug-reward', generateBugReward);

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);
router.route('/:id')
  .delete(protect, admin, deleteCoupon);

export default router;
