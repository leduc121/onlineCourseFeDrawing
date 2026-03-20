import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/Button';
import { NotificationPopover } from './NotificationPopover';

export function Navigation() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'instructor':
        return '/instructor/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#faf8f5]/95 backdrop-blur-sm border-b border-[#2d2d2d]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#ff8a80] rounded-full flex items-center justify-center">
              <span className="text-[#2d2d2d] font-serif font-bold text-lg">
                A
              </span>
            </div>
            <span className="font-serif text-2xl font-bold text-[#2d2d2d] tracking-tight">
              ArtAcademy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user?.role !== 'student' && (
              <>
                <Link to="/courses" className="text-[#2d2d2d] hover:text-[#ff8a80] font-medium transition-colors">
                  Courses
                </Link>
                <Link to="/instructors" className="text-[#2d2d2d] hover:text-[#ff8a80] font-medium transition-colors">
                  Instructors
                </Link>
                <Link to="/about" className="text-[#2d2d2d] hover:text-[#ff8a80] font-medium transition-colors">
                  About
                </Link>
                <Link to="/posts" className="text-[#2d2d2d] hover:text-[#ff8a80] font-medium transition-colors">
                  Posts
                </Link>
              </>
            )}

            <div className="flex items-center space-x-6">
              {/* Cart Icon - Visible to all users except Student */}
              {user?.role !== 'student' && (
                <Link to="/checkout" className="relative text-[#2d2d2d] hover:text-[#ff8a80]">
                  <ShoppingBag className="w-6 h-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ff8a80] text-[#2d2d2d] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Auth Section */}
              {user ? (
                <div className="flex items-center space-x-4">
                    <Link to={getDashboardLink()} className="flex items-center space-x-2 text-[#2d2d2d] hover:text-[#ff8a80]">
                      <User className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    {user.role === 'student' && (
                      <Link to="/student/support" className="text-[#2d2d2d] hover:text-[#ff8a80]">
                        <span className="font-medium text-sm">Support</span>
                      </Link>
                    )}
                    {(user.role === 'instructor' || user.role === 'staff') && (
                      <>
                        <Link to="/instructor/posts" className="text-[#2d2d2d] hover:text-[#ff8a80]">
                          <span className="font-medium text-sm">Manage Posts</span>
                        </Link>
                        {user.role === 'instructor' && (
                          <Link to="/instructor/support" className="text-[#2d2d2d] hover:text-[#ff8a80]">
                            <span className="font-medium text-sm">Support</span>
                          </Link>
                        )}
                        <Link to="/instructor/payments" className="text-[#2d2d2d] hover:text-[#ff8a80]">
                          <span className="font-medium text-sm">Payments</span>
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin/posts" className="text-[#2d2d2d] hover:text-[#ff8a80]">
                          <span className="font-medium text-sm">Review Posts</span>
                        </Link>
                        <Link to="/admin/panel" className="text-[#2d2d2d] hover:text-[#ff8a80]">
                          <span className="font-medium text-sm">Admin Panel</span>
                        </Link>
                      </>
                    )}
                  <Link to="/profile" className="flex items-center space-x-2 text-[#2d2d2d] hover:text-[#ff8a80]">
                    <span className="font-medium">Profile</span>
                  </Link>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-[#2d2d2d]">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-[#2d2d2d] font-medium hover:text-[#ff8a80]">
                    Log in
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Start Learning
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#2d2d2d]">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#faf8f5] border-b border-[#2d2d2d]/10">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <Link to="/courses" className="block text-[#2d2d2d] font-medium py-2">
              Courses
            </Link>
            <Link to="/instructors" className="block text-[#2d2d2d] font-medium py-2">
              Instructors
            </Link>
            <Link to="/posts" className="block text-[#2d2d2d] font-medium py-2">
              Posts
            </Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block text-[#2d2d2d] font-medium py-2">
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <Link to="/student/support" className="block text-[#2d2d2d] font-medium py-2">
                    Support & Issues
                  </Link>
                )}
                {user.role === 'instructor' && (
                  <>
                    <Link to="/instructor/support" className="block text-[#2d2d2d] font-medium py-2">
                      Support
                    </Link>
                    <Link to="/instructor/payments" className="block text-[#2d2d2d] font-medium py-2">
                      Payments
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/panel" className="block text-[#2d2d2d] font-medium py-2">
                    Admin Panel
                  </Link>
                )}
                <Link to="/bundles" className="block text-[#2d2d2d] font-medium py-2">
                  Course Bundles
                </Link>
                <Link to="/profile" className="block text-[#2d2d2d] font-medium py-2">
                  My Profile
                </Link>
                <button onClick={handleLogout} className="block text-red-600 font-medium py-2">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-[#2d2d2d] font-medium py-2">
                  Log in
                </Link>
                <Link to="/register" className="block w-full">
                  <Button className="w-full">Start Learning</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
