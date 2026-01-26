import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
export function Login() {
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(email, role);
      setIsLoading(false);
      // Redirect based on role
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        case 'instructor':
          navigate('/instructor/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    }, 1000);
  };
  return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-12">
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-4xl font-serif font-bold text-[#2d2d2d]">
          Welcome Back
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Continue your artistic journey
        </p>
      </div>

      <form className="mt-8 space-y-6 bg-white p-8 border-2 border-[#2d2d2d]/5 shadow-xl" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input label="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

          <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

          <Select label="I am a..." value={role} onChange={e => setRole(e.target.value as UserRole)} options={[{
            value: 'customer',
            label: 'Student / Parent'
          }, {
            value: 'instructor',
            label: 'Instructor'
          }, {
            value: 'staff',
            label: 'Staff Member'
          }, {
            value: 'admin',
            label: 'Administrator'
          }]} />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff8a80] transition-colors"
          onClick={() => {
            // Mock Google Login
            setIsLoading(true);
            setTimeout(() => {
              login('user@gmail.com', role);
              setIsLoading(false);
              navigate('/dashboard');
            }, 1000);
          }}
        >
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.54z"
              fill="#FBBC05"
            />
            <path
              d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="font-medium text-[#ff8a80] hover:text-[#e07856]">
            Register now
          </Link>
        </div>
      </form>
    </div>
  </div>;
}