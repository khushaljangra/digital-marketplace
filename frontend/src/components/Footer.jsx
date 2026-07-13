import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../utils/api';
import { Mail, Send } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const data = await request('/support/subscribe', 'POST', { email });
      if (data.success) {
        setMessage(data.message || 'Thank you for subscribing!');
        setEmail('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '60px 0 40px 0',
      marginTop: 'auto',
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-secondary)',
      fontSize: '14px'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Left branding */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            ApexMarket
          </h4>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
            Premium production-ready templates, SaaS boilerplates, and clean source code solutions for developers. Build faster, launch today.
          </p>
          <p>© {new Date().getFullYear()} ApexMarket. All rights reserved.</p>
        </div>

        {/* Center links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>Navigation</h5>
          <Link to="/projects" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>All Projects</Link>
          <Link to="/support" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Live Chat Support</Link>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
        </div>

        {/* Right newsletter */}
        <div>
          <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>Newsletter</h5>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
            Get notifications about new premium project source codes and exclusive promo coupons!
          </p>
          
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', maxWidth: '320px' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="developer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={14} />
            </button>
          </form>

          {message && <p style={{ color: 'var(--success)', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>{message}</p>}
          {error && <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>{error}</p>}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
