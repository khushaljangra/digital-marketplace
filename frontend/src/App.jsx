import React from 'react';
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

// Page Views
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectListing from './pages/ProjectListing';
import ProjectDetail from './pages/ProjectDetail';
import Cart from './pages/Cart';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import SupportChat from './pages/SupportChat';

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
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/projects" element={<ProjectListing />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/cart" element={<Cart />} />

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
              </main>

              {/* Footer Panel */}
              <Footer />

            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
