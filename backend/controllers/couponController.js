import Coupon from '../models/Coupon.js';
import { isDbConnected, mockDb } from '../config/mockDb.js';

/**
 * @desc    Validate a coupon code
 * @route   POST /api/coupons/validate
 * @access  Private
 */
export const validateCoupon = async (req, res) => {
  const { code, cartAmount } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    if (!isDbConnected()) {
      const coupon = mockDb.coupons.find(c => c.code === code.toUpperCase() && c.isActive);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon code not found' });
      }

      // Check validity in-memory
      if (new Date() > coupon.expiryDate) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      }
      if (cartAmount < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of INR ${coupon.minOrderAmount} required for this coupon`,
        });
      }

      return res.json({
        success: true,
        message: 'Coupon applied successfully!',
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon code not found' });
    }

    if (!coupon.isValid(cartAmount)) {
      if (new Date() > coupon.expiryDate) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      }
      if (cartAmount < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of INR ${coupon.minOrderAmount} required for this coupon`,
        });
      }
      return res.status(400).json({ success: false, message: 'Coupon is not valid' });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new coupon (Admin only)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit } = req.body;

  try {
    const formattedExpiryDate = new Date(expiryDate);
    formattedExpiryDate.setHours(23, 59, 59, 999);

    if (!isDbConnected()) {
      const couponExists = mockDb.coupons.some(c => c.code === code.toUpperCase());
      if (couponExists) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }

      const coupon = {
        _id: `coupon_mock_${Date.now()}`,
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        expiryDate: formattedExpiryDate,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        usedCount: 0,
        isActive: true,
        createdAt: new Date()
      };

      mockDb.coupons.push(coupon);
      return res.status(201).json({ success: true, coupon });
    }

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate: formattedExpiryDate,
      usageLimit,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all coupons (Admin only)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
export const getCoupons = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, coupons: mockDb.coupons });
    }
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete/Deactivate a coupon (Admin only)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = async (req, res) => {
  try {
    if (!isDbConnected()) {
      mockDb.coupons = mockDb.coupons.filter(c => c._id !== req.params.id);
      return res.json({ success: true, message: 'Coupon deleted successfully' });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get the latest active coupon (Public)
 * @route   GET /api/coupons/latest-active
 * @access  Public
 */
export const getLatestActiveCoupon = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const activeCoupons = mockDb.coupons.filter(c => c.isActive && new Date() <= new Date(c.expiryDate));
      const latest = activeCoupons.length > 0 ? activeCoupons[activeCoupons.length - 1] : null;
      return res.json({ success: true, coupon: latest });
    }

    const latest = await Coupon.findOne({ isActive: true, expiryDate: { $gt: new Date() } }).sort({ createdAt: -1 });
    res.json({ success: true, coupon: latest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate a dynamic 10% coupon reward for daily bug game (Public)
 * @route   POST /api/coupons/generate-bug-reward
 * @access  Public
 */
export const generateBugReward = async (req, res) => {
  try {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `BUGBUSTER-${randomSuffix}`;

    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    expiry.setHours(23, 59, 59, 999);

    if (!isDbConnected()) {
      const coupon = {
        _id: `coupon_mock_bug_${Date.now()}`,
        code,
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: null,
        expiryDate: expiry,
        usageLimit: 1,
        usedCount: 0,
        isActive: true,
        createdAt: new Date()
      };

      mockDb.coupons.push(coupon);
      return res.status(201).json({ success: true, code, message: 'Reward coupon generated! Valid for 24 hours.' });
    }

    const coupon = await Coupon.create({
      code,
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscount: null,
      expiryDate: expiry,
      usageLimit: 1,
    });

    res.status(201).json({ success: true, code: coupon.code, message: 'Reward coupon generated! Valid for 24 hours.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

