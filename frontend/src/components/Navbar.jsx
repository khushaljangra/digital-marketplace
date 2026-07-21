import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 0',
      borderBottom: '1px solid var(--border)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" onClick={closeMobileMenu} style={{
          textDecoration: 'none',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Sparkles size={20} />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '22px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            ApexMarket
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links-desktop">
          <Link to="/projects" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 500
          }}>
            Browse Projects
          </Link>

          
          {user && (
            <Link to="/support" style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <MessageSquare size={16} />
              Support
            </Link>
          )}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }} title="Toggle Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Wishlist Link */}
          {user && (
            <Link to="/wishlist" style={{
              color: 'var(--text-secondary)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }} title="Wishlist">
              <Heart size={20} />
            </Link>
          )}

          {/* Cart Icon */}
          <Link to="/cart" style={{
            color: 'var(--text-secondary)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }} title="Cart">
            <ShoppingCart size={20} />
            {cartItems.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)'
              }}>
                {cartItems.length}
              </span>
            )}
          </Link>

          <span style={{ height: '20px', width: '1px', background: 'var(--border)' }}></span>

          {/* User Account Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {user.role === 'admin' ? (
                <Link to="/admin" className="btn btn-secondary" style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <LayoutDashboard size={14} />
                  Admin
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-secondary" style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <User size={14} />
                  Dashboard
                </Link>
              )}
              
              <button onClick={handleLogout} style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/login" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600
              }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{
                padding: '8px 16px',
                fontSize: '14px'
              }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Icons Panel (Cart, Toggle) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '16px' }} className="navbar-toggle-mobile">
          <Link to="/cart" onClick={closeMobileMenu} style={{
            color: 'var(--text-secondary)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <ShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '9px',
                fontWeight: 'bold',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{cartItems.length}</span>
            )}
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay (Blurs webpage background) */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-backdrop" onClick={closeMobileMenu} />
      )}

      {/* Mobile Dropdown Drawer */}
      <div className={`navbar-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Drawer Header with Close Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px',
          marginBottom: '8px'
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>
            Menu Navigation
          </span>
          <button onClick={closeMobileMenu} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            padding: '4px'
          }}>
            <X size={20} />
          </button>
        </div>

        <Link to="/projects" onClick={closeMobileMenu} style={{
          color: 'var(--text-primary)',
          textDecoration: 'none',
          fontSize: '15px',
          fontWeight: 600,
          borderBottom: '1px solid var(--border)',
          paddingBottom: '10px'
        }}>
          Browse Projects
        </Link>

        
        {user && (
          <Link to="/support" onClick={closeMobileMenu} style={{
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 600,
            borderBottom: '1px solid var(--border)',
            paddingBottom: '10px'
          }}>
            Support Chat
          </Link>
        )}

        {user && (
          <Link to="/wishlist" onClick={closeMobileMenu} style={{
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 600,
            borderBottom: '1px solid var(--border)',
            paddingBottom: '10px'
          }}>
            My Wishlist
          </Link>
        )}

        {/* Theme Toggler inside mobile menu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Appearance Theme</span>
          <button onClick={toggleTheme} style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {isDarkMode ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>
        </div>

        {/* Mobile auth triggers */}
        <div style={{ marginTop: '10px' }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user.role === 'admin' ? (
                <Link to="/admin" onClick={closeMobileMenu} className="btn btn-secondary" style={{ width: '100%' }}>
                  <LayoutDashboard size={16} /> Admin Portal
                </Link>
              ) : (
                <Link to="/dashboard" onClick={closeMobileMenu} className="btn btn-secondary" style={{ width: '100%' }}>
                  <User size={16} /> User Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
                <LogOut size={16} /> Logout Session
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/login" onClick={closeMobileMenu} className="btn btn-secondary" style={{ width: '100%' }}>
                Sign In
              </Link>
              <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary" style={{ width: '100%' }}>
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
