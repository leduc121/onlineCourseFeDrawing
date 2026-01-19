import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
export function Register() {
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(formData.email, formData.role);
      setIsLoading(false);
      if (formData.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    }, 1000);
  };
  return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-serif font-bold text-[#2d2d2d]">
            Join ArtAcademy
          </h2>
          <p className="mt-2 text-lg text-gray-600">Start creating today</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 border-2 border-[#2d2d2d]/5 shadow-xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input label="Full Name" type="text" required value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} placeholder="Picasso Jr." />

            <Input label="Email address" type="email" required value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} placeholder="you@example.com" />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Password" type="password" required value={formData.password} onChange={e => setFormData({
              ...formData,
              password: e.target.value
            })} placeholder="••••••••" />
              <Input label="Confirm" type="password" required value={formData.confirmPassword} onChange={e => setFormData({
              ...formData,
              confirmPassword: e.target.value
            })} placeholder="••••••••" />
            </div>

            <Select label="I want to..." value={formData.role} onChange={e => setFormData({
            ...formData,
            role: e.target.value as UserRole
          })} options={[{
            value: 'customer',
            label: 'Learn Art (Student/Parent)'
          }, {
            value: 'instructor',
            label: 'Teach Art (Instructor)'
          }]} />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-[#ff8a80] hover:text-[#e07856]">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>;
}