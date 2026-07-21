import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers Contexts
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components & Guard Routes
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PromoBanner from './components/PromoBanner';

// Lazy load heavy components
const AIChatbot = lazy(() => import('./components/AIChatbot'));

// Lazy load page views for performance optimization
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProjectListing = lazy(() => import('./pages/ProjectListing'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const SupportChat = lazy(() => import('./pages/SupportChat'));
const UiGallery = lazy(() => import('./pages/UiGallery'));

// Lightweight page loading indicator
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    flexDirection: 'column',
    gap: '1rem',
    color: 'var(--text-secondary)'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid rgba(99, 102, 241, 0.1)',
      borderTop: '3px solid var(--accent-primary, #6366f1)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Loading page...</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}>
              
              {/* Promo Banner & Navigation */}
              <PromoBanner />
              <Navbar />

              {/* Page Viewport */}
              <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/projects" element={<ProjectListing />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/ui-gallery" element={<UiGallery />} />

                    {/* Authenticated user routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/support"
                      element={
                        <ProtectedRoute>
                          <SupportChat />
                        </ProtectedRoute>
                      }
                    />

                    {/* Administrative routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />

                    {/* Fallback Catch-All */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>

              {/* Footer Panel */}
              <Footer />
              <Suspense fallback={null}>
                <AIChatbot />
              </Suspense>

            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
