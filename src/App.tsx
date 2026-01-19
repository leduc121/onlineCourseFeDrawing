import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CourseCatalog } from './pages/CourseCatalog';
import { CourseDetail } from './pages/CourseDetail';
import { Checkout } from './pages/Checkout';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
export function App() {
  return <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-[#faf8f5]">
            <Navigation />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/course/:id" element={<CourseDetail />} />

              {/* Protected Customer Routes */}
              <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}>
                    <Checkout />
                  </ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>} />

              {/* Protected Instructor Routes */}
              <Route path="/instructor/dashboard" element={<ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboard />
                  </ProtectedRoute>} />

              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>} />

              {/* Staff routes would go here similarly */}
              <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff']}>
                    <div className="p-12 text-center">
                      Staff Dashboard Placeholder
                    </div>
                  </ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>;
}