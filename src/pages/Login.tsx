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