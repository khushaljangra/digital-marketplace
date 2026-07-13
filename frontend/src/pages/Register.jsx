import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, Gift, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If referral code is passed in URL query e.g. /register?ref=ABCD12
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register(name, email, password, referralCode);
      if (data?.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 20px'
    }} className="animate-fade-in">
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '16px'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Join ApexMarket to download premium digital files
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={18} />
              </span>
              <input
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid var(--border)',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            marginBottom: '14px'
          }}>
            💡 <strong>Invite Friends & Learn for Free!</strong> Share your referral link with developer friends. Every time a friend registers with your link, we credit <strong>INR 100</strong> straight to your wallet balance. Buy premium projects for free!
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Referral Code (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Gift size={18} />
              </span>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '44px', textTransform: 'uppercase' }}
                placeholder="E.g., ABCD12"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>
            {referralCode && (
              <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                ✓ Referral code applied! Your referrer gets INR 100 on signup completion.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
          >
            {loading ? 'Creating Account...' : 'Get Started'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Login here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
