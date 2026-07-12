import express from 'express';
import {
  checkout,
  verifyPayment,
  getMyPurchasedProjects,
  getDownloadHistory,
  getAllOrders,
  createQrOrder,
  verifyUtrOrder,
  rejectUtrOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkout', protect, checkout);
router.post('/verify', protect, verifyPayment);
router.post('/qr-checkout', createQrOrder);
router.post('/verify-utr/:id', protect, admin, verifyUtrOrder);
router.post('/reject-utr/:id', protect, admin, rejectUtrOrder);
router.get('/my-purchases', protect, getMyPurchasedProjects);
router.get('/download-history', protect, getDownloadHistory);
router.get('/', protect, admin, getAllOrders);

export default router;
