import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import { Tag, X } from 'lucide-react';

const PromoBanner = () => {
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchActiveCoupon = async () => {
      try {
        const data = await request('/coupons/latest-active', 'GET');
        if (data.success && data.coupon) {
          const coupon = data.coupon;
          // Check if user dismissed this specific coupon in the current session
          const dismissedCoupon = sessionStorage.getItem(`dismissed_coupon_${coupon.code}`);
          if (!dismissedCoupon) {
            setActiveCoupon(coupon);
            setIsVisible(true);
          }
        }
      } catch (err) {
        // Fail silently so it doesn't break the UI
        console.error('Failed to fetch active coupon:', err.message);
      }
    };

    fetchActiveCoupon();
  }, []);

  const handleDismiss = () => {
    if (activeCoupon) {
      sessionStorage.setItem(`dismissed_coupon_${activeCoupon.code}`, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible || !activeCoupon) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const discountText =
    activeCoupon.discountType === 'percentage'
      ? `${activeCoupon.discountValue}% OFF`
      : `Flat INR ${activeCoupon.discountValue} OFF`;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        color: '#ffffff',
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', paddingRight: '24px' }}>
        <Tag size={14} className="animate-pulse" />
        <span>
          Special Offer: Get <strong style={{ textDecoration: 'underline' }}>{discountText}</strong> on all projects!
        </span>
        <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Code: <strong style={{ color: '#fef08a' }}>{activeCoupon.code}</strong>
        </span>
        <span style={{ fontSize: '12px', opacity: 0.9 }}>
          (Ends {formatDate(activeCoupon.expiryDate)})
        </span>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          right: '12px',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8,
          transition: 'opacity 0.2s',
          padding: '4px'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default PromoBanner;
