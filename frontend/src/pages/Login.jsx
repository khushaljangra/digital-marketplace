import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { request } from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP states
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  const { login, loadProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to target path or dashboard
  const from = location.state?.from?.pathname || '/';

  // Load Google Auth script dynamically
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1047805230985-dummygoogleclientid.apps.googleusercontent.com',
            callback: handleGoogleLoginResponse,
          });
          window.google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large', width: 348 }
          );
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const handleGoogleLoginResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const data = await request('/auth/google-login', 'POST', {
        credential: response.credential,
      });
      if (data?.success) {
        localStorage.setItem('token', data.token);
        await loadProfile();
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setOtpLoading(true);
    setOtpSuccessMsg('');

    try {
      const data = await request('/auth/send-otp', 'POST', { email });
      if (data.success) {
        setOtpSent(true);
        setOtpSuccessMsg('Verification OTP code sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check SMTP settings.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMethod === 'password') {
        const data = await login(email, password);
        if (data?.success) {
          navigate(from, { replace: true });
        }
      } else {
        // OTP verify login
        if (!otp) {
          setError('Please enter the OTP verification code sent to your email.');
          setLoading(false);
          return;
        }
        const data = await request('/auth/verify-otp', 'POST', { email, otp });
        if (data?.success) {
          localStorage.setItem('token', data.token);
          await loadProfile();
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '40px 20px'
    }} className="animate-fade-in">
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '36px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
          <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Sign in to access your dashboard & files
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setError('');
              setOtpSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: loginMethod === 'password' ? 'var(--bg-secondary)' : 'transparent',
              color: loginMethod === 'password' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: loginMethod === 'password' ? 'var(--shadow-sm)' : 'none',
              transition: '0.2s'
            }}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setError('');
              setOtpSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: loginMethod === 'otp' ? 'var(--bg-secondary)' : 'transparent',
              color: loginMethod === 'otp' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: loginMethod === 'otp' ? 'var(--shadow-sm)' : 'none',
              transition: '0.2s'
            }}
          >
            OTP Login
          </button>
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

        {otpSuccessMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34d399',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            fontWeight: 500
          }}>
            {otpSuccessMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
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
                disabled={loginMethod === 'otp' && otpSent}
              />
            </div>
          </div>

          {loginMethod === 'password' ? (
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
          ) : (
            <>
              {otpSent && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Enter 6-Digit OTP Code
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <KeyRound size={18} />
                    </span>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      className="form-input"
                      style={{ paddingLeft: '44px', letterSpacing: '4px', fontWeight: 'bold' }}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !email}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                >
                  {otpLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              ) : null}
            </>
          )}

          {(loginMethod === 'password' || otpSent) && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          )}
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
          margin: '24px 0'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ padding: '0 10px', fontWeight: 500 }}>OR SIGN IN WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        {/* Google OAuth Login Button Container */}
        <div id="googleSignInDiv" style={{ display: 'flex', justifyContent: 'center', minHeight: '40px' }}></div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
