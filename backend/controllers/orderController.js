import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import Project from '../models/Project.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import DownloadLog from '../models/DownloadLog.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';
import { generateSignedDownloadUrl } from '../config/storage.js';
import { sendPurchaseEmail } from '../config/mail.js';
import { isDbConnected, mockDb } from '../config/mockDb.js';
import { sendTelegramMessage, answerCallbackQuery, editTelegramMessage } from '../config/telegram.js';

/**
 * @desc    Initialize a checkout order and create Razorpay order ID
 * @route   POST /api/orders/checkout
 * @access  Private
 */
export const checkout = async (req, res) => {
  const { projectIds, couponCode } = req.body;

  try {
    if (!projectIds || projectIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No projects in checkout' });
    }

    if (!isDbConnected()) {
      const projects = mockDb.projects.filter(p => projectIds.includes(p._id));
      if (projects.length === 0) {
        return res.status(404).json({ success: false, message: 'Projects not found' });
      }

      let subtotal = projects.reduce((acc, curr) => acc + curr.price, 0);
      let discountAmount = 0;
      let totalAmount = subtotal;

      if (couponCode) {
        const coupon = mockDb.coupons.find(c => c.code === couponCode.toUpperCase() && c.isActive);
        if (coupon) {
          if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
          totalAmount = Math.max(0, subtotal - discountAmount);
        }
      }

      const rpOrder = {
        id: `order_mock_${Math.random().toString(36).substring(2, 12)}`,
        amount: totalAmount,
      };

      const order = {
        _id: `ord_mock_${Date.now()}`,
        user: req.user._id,
        items: projects.map(p => ({ project: p._id, priceAtPurchase: p.price, titleAtPurchase: p.title })),
        totalAmount,
        discountAmount,
        couponApplied: couponCode ? couponCode.toUpperCase() : null,
        paymentStatus: 'pending',
        razorpayOrderId: rpOrder.id,
        createdAt: new Date()
      };

      mockDb.orders.push(order);

      return res.status(201).json({
        success: true,
        orderId: order._id,
        razorpayOrderId: rpOrder.id,
        amount: totalAmount,
        currency: 'INR',
        key: 'sandbox_key',
        isMock: true
      });
    }

    // Fetch projects
    const projects = await Project.find({ _id: { $in: projectIds } });
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Projects not found' });
    }

    // Calculate subtotal
    let subtotal = projects.reduce((acc, curr) => acc + curr.price, 0);
    let discountAmount = 0;
    let totalAmount = subtotal;

    // Apply coupon if valid
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.isValid(subtotal)) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }

        totalAmount = Math.max(0, subtotal - discountAmount);
      } else {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
      }
    }

    // Generate unique order receipt ID
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Create Razorpay Order
    const rpOrder = await createRazorpayOrder(totalAmount, receiptId);

    // Create pending order in database
    const orderItems = projects.map((proj) => ({
      project: proj._id,
      priceAtPurchase: proj.price,
      titleAtPurchase: proj.title,
    }));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      discountAmount,
      couponApplied: couponCode ? couponCode.toUpperCase() : null,
      paymentStatus: 'pending',
      razorpayOrderId: rpOrder.id,
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: rpOrder.id,
      amount: totalAmount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'sandbox_key', // Client needs key to open Razorpay checkout
      isMock: rpOrder.isMock || false,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify Razorpay payment status
 * @route   POST /api/orders/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    if (!isDbConnected()) {
      const order = mockDb.orders.find(o => o.razorpayOrderId === razorpayOrderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;

      // Update coupon usage
      if (order.couponApplied) {
        const coupon = mockDb.coupons.find(c => c.code === order.couponApplied);
        if (coupon) coupon.usedCount += 1;
      }

      // Generate mock links
      const downloadLinks = order.items.map(item => ({
        title: item.titleAtPurchase,
        downloadUrl: `http://localhost:5000/api/projects/download-secure?token=mock_download_token_${item.project}`
      }));

      // Log email content
      await sendPurchaseEmail(req.user.email, req.user.name, order, downloadLinks);

      return res.json({
        success: true,
        message: 'Payment verified successfully and downloads unlocked.',
        order
      });
    }

    // 1. Verify signatures
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // 2. Find order and update status
    const order = await Order.findOne({ razorpayOrderId }).populate('items.project');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({ success: true, message: 'Payment already verified', order });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    // 3. Update coupon usage
    if (order.couponApplied) {
      await Coupon.findOneAndUpdate(
        { code: order.couponApplied },
        { $inc: { usedCount: 1 } }
      );
    }

    // 4. Generate download links & send confirmation email
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const downloadLinks = [];
    for (const item of order.items) {
      const downloadUrl = generateSignedDownloadUrl(
        item.project.fileKey,
        item.project.fileName,
        order.user.toString(),
        item.project._id.toString(),
        order._id.toString(),
        hostUrl
      );
      downloadLinks.push({
        title: item.project.title,
        downloadUrl,
      });
    }

    // Fetch user details for emailing
    const user = await User.findById(order.user);
    if (user) {
      await sendPurchaseEmail(user.email, user.name, order, downloadLinks);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully and downloads unlocked.',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get logged in user's purchased items
 * @route   GET /api/orders/my-purchases
 * @access  Private
 */
export const getMyPurchasedProjects = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const userOrders = mockDb.orders.filter(o => o.user === req.user._id && o.paymentStatus === 'paid');
      const purchases = [];
      const seenIds = new Set();
      
      // Auto-unlock first 3 projects for testing download links immediately without checkout
      if (req.user.email === 'user@marketplace.com' && userOrders.length === 0) {
        mockDb.projects.slice(0, 3).forEach(p => {
          purchases.push({
            project: p,
            purchasedAt: new Date(),
            orderId: 'order_seed_mock',
            pricePaid: p.price
          });
        });
        return res.json({ success: true, count: purchases.length, purchases });
      }

      for (const order of userOrders) {
        for (const item of order.items) {
          const fullProj = mockDb.projects.find(p => p._id === item.project);
          if (fullProj && !seenIds.has(fullProj._id)) {
            seenIds.add(fullProj._id);
            purchases.push({
              project: fullProj,
              purchasedAt: order.createdAt,
              orderId: order._id,
              pricePaid: item.priceAtPurchase
            });
          }
        }
      }
      return res.json({ success: true, count: purchases.length, purchases });
    }

    // Get all paid orders for the user
    const orders = await Order.find({ user: req.user._id, paymentStatus: 'paid' }).populate('items.project');
    
    // Extract unique projects
    const purchasedProjects = [];
    const seenIds = new Set();

    for (const order of orders) {
      for (const item of order.items) {
        if (item.project && !seenIds.has(item.project._id.toString())) {
          seenIds.add(item.project._id.toString());
          purchasedProjects.push({
            project: item.project,
            purchasedAt: order.createdAt,
            orderId: order._id,
            pricePaid: item.priceAtPurchase,
          });
        }
      }
    }

    res.json({ success: true, count: purchasedProjects.length, purchases: purchasedProjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user's download logs/history
 * @route   GET /api/orders/download-history
 * @access  Private
 */
export const getDownloadHistory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, count: mockDb.downloads.length, history: mockDb.downloads });
    }

    const logs = await DownloadLog.find({ user: req.user._id })
      .populate('project', 'title category')
      .sort({ lastDownloadedAt: -1 });

    res.json({ success: true, count: logs.length, history: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    if (!isDbConnected()) {
      // populate users manually
      const populated = mockDb.orders.map(o => {
        const u = mockDb.users.find(usr => usr._id === o.user);
        return {
          ...o,
          user: u ? { name: u.name, email: u.email } : null
        };
      });
      return res.json({ success: true, count: populated.length, orders: populated });
    }

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.project', 'title category price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit manual QR code payment with UTR reference
 * @route   POST /api/orders/qr-checkout
 * @access  Private
 */
export const createQrOrder = async (req, res) => {
  const { projectIds, couponCode, transactionRef, contactEmail, contactPhone } = req.body;

  try {
    if (!projectIds || projectIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No projects in checkout' });
    }
    if (!transactionRef || transactionRef.trim().length !== 12 || isNaN(transactionRef)) {
      return res.status(400).json({ success: false, message: 'Invalid 12-digit UPI UTR Transaction Reference Number' });
    }
    if (!contactEmail || !contactEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (!contactPhone || contactPhone.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    if (!isDbConnected()) {
      // Prevent reusing UTRs in mock memory
      const existingUtr = mockDb.orders.find(o => o.transactionRef === transactionRef);
      if (existingUtr) {
        return res.status(400).json({ success: false, message: 'This UTR has already been submitted. Please enter a unique transaction ID.' });
      }

      // Check if user is logged in via header, or find/create dynamically
      let targetUser;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          const authParts = req.headers.authorization.split(' ');
          const token = authParts[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_9918237');
          targetUser = mockDb.users.find(u => u._id === decoded.id);
        } catch (err) {
          // ignore token error
        }
      }

      if (!targetUser) {
        targetUser = mockDb.users.find(u => u.email.toLowerCase() === contactEmail.toLowerCase());
        if (!targetUser) {
          targetUser = {
            _id: `usr_mock_guest_${Date.now()}`,
            name: contactEmail.split('@')[0],
            email: contactEmail.toLowerCase(),
            role: 'user',
            createdAt: new Date()
          };
          mockDb.users.push(targetUser);
        }
      }

      const projects = mockDb.projects.filter(p => projectIds.includes(p._id));
      if (projects.length === 0) {
        return res.status(404).json({ success: false, message: 'Projects not found' });
      }

      let subtotal = projects.reduce((acc, curr) => acc + curr.price, 0);
      let discountAmount = 0;
      let totalAmount = subtotal;

      if (couponCode) {
        const coupon = mockDb.coupons.find(c => c.code === couponCode.toUpperCase() && c.isActive);
        if (coupon) {
          if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          totalAmount = Math.max(0, subtotal - discountAmount);
        }
      }

      const order = {
        _id: `ord_mock_${Date.now()}`,
        user: targetUser._id,
        items: projects.map(p => ({ project: p._id, priceAtPurchase: p.price, titleAtPurchase: p.title })),
        totalAmount,
        discountAmount,
        couponApplied: couponCode ? couponCode.toUpperCase() : null,
        paymentStatus: 'pending_verification',
        paymentMethod: 'qr_code',
        transactionRef,
        contactEmail,
        contactPhone,
        createdAt: new Date()
      };

      mockDb.orders.push(order);

      // Send Telegram notification
      const tgMessageText = `🔔 <b>New Order Received (Sandbox/Mock)</b>\n\n` +
        `📦 <b>Order ID:</b> <code>${order._id}</code>\n` +
        `📧 <b>Email:</b> ${contactEmail}\n` +
        `📞 <b>Phone:</b> ${contactPhone}\n` +
        `💵 <b>Amount:</b> INR ${totalAmount}\n` +
        `🔑 <b>UTR/Ref:</b> <code>${transactionRef}</code>\n\n` +
        `Please verify the payment in your bank account before approving.`;
      
      const replyMarkup = {
        inline_keyboard: [
          [
            { text: '✅ Approve', callback_data: `approve_${order._id}` },
            { text: '❌ Reject', callback_data: `reject_${order._id}` }
          ]
        ]
      };
      sendTelegramMessage(tgMessageText, replyMarkup).catch(err => console.error('Telegram notification failed:', err.message));

      const token = jwt.sign({ id: targetUser._id }, process.env.JWT_SECRET || 'supersecretkey_9918237', { expiresIn: '30d' });

      return res.status(201).json({
        success: true,
        message: 'Order submitted. Pending manual verification by admin.',
        orderId: order._id,
        token,
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role
        }
      });
    }

    // DB Mode
    // Prevent reusing UTRs in Database
    const existingUtr = await Order.findOne({ transactionRef });
    if (existingUtr) {
      return res.status(400).json({ success: false, message: 'This UTR has already been submitted. Please enter a unique transaction ID.' });
    }

    // Check if user is logged in via header, or find/create dynamically
    let targetUser;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const authParts = req.headers.authorization.split(' ');
        const token = authParts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_9918237');
        targetUser = await User.findById(decoded.id);
      } catch (err) {
        // ignore token error
      }
    }

    if (!targetUser) {
      targetUser = await User.findOne({ email: contactEmail.toLowerCase() });
      if (!targetUser) {
        targetUser = await User.create({
          name: contactEmail.split('@')[0],
          email: contactEmail.toLowerCase(),
          password: 'guest_' + Math.random().toString(36).substring(2, 10),
          role: 'user'
        });
      }
    }

    const projects = await Project.find({ _id: { $in: projectIds } });
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Projects not found' });
    }

    let subtotal = projects.reduce((acc, curr) => acc + curr.price, 0);
    let discountAmount = 0;
    let totalAmount = subtotal;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.isValid(subtotal)) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        totalAmount = Math.max(0, subtotal - discountAmount);
      }
    }

    const orderItems = projects.map(p => ({ project: p._id, priceAtPurchase: p.price, titleAtPurchase: p.title }));
    const order = await Order.create({
      user: targetUser._id,
      items: orderItems,
      totalAmount,
      discountAmount,
      couponApplied: couponCode ? couponCode.toUpperCase() : null,
      paymentStatus: 'pending_verification',
      paymentMethod: 'qr_code',
      transactionRef,
      contactEmail,
      contactPhone
    });

    // Send Telegram notification
    const tgMessageText = `🔔 <b>New Order Received (Live UPI)</b>\n\n` +
      `📦 <b>Order ID:</b> <code>${order._id}</code>\n` +
      `📧 <b>Email:</b> ${contactEmail}\n` +
      `📞 <b>Phone:</b> ${contactPhone}\n` +
      `💵 <b>Amount:</b> INR ${totalAmount}\n` +
      `🔑 <b>UTR/Ref:</b> <code>${transactionRef}</code>\n\n` +
      `Please verify the payment in your bank account before approving.`;
    
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: `approve_${order._id}` },
          { text: '❌ Reject', callback_data: `reject_${order._id}` }
        ]
      ]
    };
    sendTelegramMessage(tgMessageText, replyMarkup).catch(err => console.error('Telegram notification failed:', err.message));

    const token = jwt.sign({ id: targetUser._id }, process.env.JWT_SECRET || 'supersecretkey_9918237', { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      message: 'Order submitted. Pending manual verification by admin.',
      orderId: order._id,
      token,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Approve manual QR code payment UTR (Admin only)
 * @route   POST /api/orders/verify-utr/:id
 * @access  Private/Admin
 */
export const verifyUtrOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const hostUrl = `${req.protocol}://${req.get('host')}`;

    if (!isDbConnected()) {
      const order = mockDb.orders.find(o => o._id === orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.paymentStatus = 'paid';

      // Send mock confirmation email
      const user = mockDb.users.find(u => u._id === order.user);
      const downloadLinks = order.items.map(item => ({
        title: item.titleAtPurchase,
        downloadUrl: `${hostUrl}/api/projects/download-secure?token=mock_download_token_${item.project}`
      }));
      await sendPurchaseEmail(user ? user.email : 'user@marketplace.com', user ? user.name : 'Customer', order, downloadLinks);

      return res.json({ success: true, message: 'Order approved successfully.', order });
    }

    const order = await Order.findById(orderId).populate('items.project').populate('user');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = 'paid';
    await order.save();

    // Send confirmation email with download links
    const downloadLinks = [];
    for (const item of order.items) {
      const downloadUrl = generateSignedDownloadUrl(
        item.project.fileKey,
        item.project.fileName,
        order.user._id.toString(),
        item.project._id.toString(),
        order._id.toString(),
        hostUrl
      );
      downloadLinks.push({
        title: item.project.title,
        downloadUrl,
      });
    }
    await sendPurchaseEmail(order.user.email, order.user.name, order, downloadLinks);

    res.json({ success: true, message: 'Order approved successfully.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Reject manual QR code payment UTR (Admin only)
 * @route   POST /api/orders/reject-utr/:id
 * @access  Private/Admin
 */
export const rejectUtrOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!isDbConnected()) {
      const order = mockDb.orders.find(o => o._id === orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.paymentStatus = 'failed';
      return res.json({ success: true, message: 'Order rejected successfully.', order });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = 'failed';
    await order.save();

    res.json({ success: true, message: 'Order rejected successfully.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete transaction / order (Admin only)
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!isDbConnected()) {
      mockDb.orders = mockDb.orders.filter(o => o._id !== orderId);
      return res.json({ success: true, message: 'Order transaction deleted successfully' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.deleteOne();
    res.json({ success: true, message: 'Order transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Handle Telegram Bot inline keyboard interaction (Approve/Reject order)
 * @route   POST /api/orders/telegram-webhook
 * @access  Public (called by Telegram API)
 */
export const telegramWebhook = async (req, res) => {
  try {
    const { callback_query } = req.body;

    if (callback_query) {
      const callbackQueryId = callback_query.id;
      const data = callback_query.data;
      const tgMsg = callback_query.message;
      const messageId = tgMsg.message_id;
      const originalText = tgMsg.text;

      let action, orderId;
      if (data.startsWith('approve_')) {
        action = 'approve';
        orderId = data.replace('approve_', '');
      } else if (data.startsWith('reject_')) {
        action = 'reject';
        orderId = data.replace('reject_', '');
      }

      if (!orderId) {
        await answerCallbackQuery(callbackQueryId, 'Invalid Order ID');
        return res.sendStatus(200);
      }

      const hostUrl = `${req.protocol}://${req.get('host')}`;

      if (action === 'approve') {
        if (!isDbConnected()) {
          const order = mockDb.orders.find(o => o._id === orderId);
          if (!order) {
            await answerCallbackQuery(callbackQueryId, 'Order not found');
            return res.sendStatus(200);
          }
          if (order.paymentStatus === 'paid') {
            await answerCallbackQuery(callbackQueryId, 'Order already approved');
            return res.sendStatus(200);
          }

          order.paymentStatus = 'paid';
          const user = mockDb.users.find(u => u._id === order.user);
          const downloadLinks = order.items.map(item => ({
            title: item.titleAtPurchase,
            downloadUrl: `${hostUrl}/api/projects/download-secure?token=mock_download_token_${item.project}`
          }));
          await sendPurchaseEmail(user ? user.email : 'user@marketplace.com', user ? user.name : 'Customer', order, downloadLinks);
        } else {
          const order = await Order.findById(orderId).populate('items.project').populate('user');
          if (!order) {
            await answerCallbackQuery(callbackQueryId, 'Order not found');
            return res.sendStatus(200);
          }
          if (order.paymentStatus === 'paid') {
            await answerCallbackQuery(callbackQueryId, 'Order already approved');
            return res.sendStatus(200);
          }

          order.paymentStatus = 'paid';
          await order.save();

          const downloadLinks = [];
          for (const item of order.items) {
            const downloadUrl = generateSignedDownloadUrl(
              item.project.fileKey,
              item.project.fileName,
              order.user._id.toString(),
              item.project._id.toString(),
              order._id.toString(),
              hostUrl
            );
            downloadLinks.push({
              title: item.project.title,
              downloadUrl,
            });
          }
          await sendPurchaseEmail(order.user.email, order.user.name, order, downloadLinks);
        }

        await editTelegramMessage(messageId, `${originalText}\n\n✅ <b>APPROVED by Admin via Telegram</b>`);
        await answerCallbackQuery(callbackQueryId, 'Order approved successfully!');
      } else if (action === 'reject') {
        if (!isDbConnected()) {
          const order = mockDb.orders.find(o => o._id === orderId);
          if (!order) {
            await answerCallbackQuery(callbackQueryId, 'Order not found');
            return res.sendStatus(200);
          }
          order.paymentStatus = 'failed';
        } else {
          const order = await Order.findById(orderId);
          if (!order) {
            await answerCallbackQuery(callbackQueryId, 'Order not found');
            return res.sendStatus(200);
          }
          order.paymentStatus = 'failed';
          await order.save();
        }

        await editTelegramMessage(messageId, `${originalText}\n\n❌ <b>REJECTED by Admin via Telegram</b>`);
        await answerCallbackQuery(callbackQueryId, 'Order rejected.');
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling Telegram Webhook:', error.message);
    res.sendStatus(500);
  }
};
