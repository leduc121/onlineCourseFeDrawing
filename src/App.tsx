import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CourseCatalog } from './pages/CourseCatalog';
import { CourseDetail } from './pages/CourseDetail';
import { Checkout } from './pages/Checkout';
import { MembershipCheckout } from './pages/MembershipCheckout';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AboutUs } from './pages/AboutUs';
import { ManageCourse } from './pages/ManageCourse';
import { Profile } from './pages/Profile';
import { CoursePlay } from './pages/CoursePlay';
import { PostList } from './pages/PostList';
import { PostDetail } from './pages/PostDetail';
import { ManagePost } from './pages/ManagePost';
import { AdminPostReview } from './pages/AdminPostReview';

export function App() {
  return <AuthProvider>
    <CartProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-[#faf8f5]">
          <Navigation />
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/:id" element={<PostDetail />} />

            {/* Protected Customer Routes */}
            <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}>
              <Checkout />
            </ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>} />
            <Route path="/membership-checkout" element={<ProtectedRoute allowedRoles={['customer']}>
              <MembershipCheckout />
            </ProtectedRoute>} />

            {/* Protected Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>} />
            <Route path="/course/:id/learn" element={<ProtectedRoute allowedRoles={['student']}>
              <CoursePlay />
            </ProtectedRoute>} />

            {/* Protected Instructor Routes */}
            <Route path="/instructor/dashboard" element={<ProtectedRoute allowedRoles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>} />
            <Route path="/instructor/create-course" element={<ProtectedRoute allowedRoles={['instructor']}>
              <ManageCourse />
            </ProtectedRoute>} />
            <Route path="/instructor/edit-course/:id" element={<ProtectedRoute allowedRoles={['instructor']}>
              <ManageCourse />
            </ProtectedRoute>} />
            <Route path="/instructor/posts" element={<ProtectedRoute allowedRoles={['instructor', 'staff']}>
              <ManagePost />
            </ProtectedRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>} />
            <Route path="/admin/posts" element={<ProtectedRoute allowedRoles={['admin']}>
              <AdminPostReview />
            </ProtectedRoute>} />

            <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff']}>
              <div className="p-12 text-center">
                Staff Dashboard Placeholder
              </div>
            </ProtectedRoute>} />

            {/* Profile Page - common for all logged in users */}
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer', 'instructor', 'staff', 'admin', 'student']}>
              <Profile />
            </ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  </AuthProvider>;
}