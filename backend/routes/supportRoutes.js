import express from 'express';
import {
  getMessages,
  sendMessage,
  getAdminChats,
  subscribeNewsletter,
  chatAdvisor,
} from '../controllers/supportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscribe', subscribeNewsletter);
router.post('/ai-chat', chatAdvisor);

router.route('/')
  .get(protect, getMessages)
  .post(protect, sendMessage);

router.get('/admin/chats', protect, admin, getAdminChats);

export default router;
