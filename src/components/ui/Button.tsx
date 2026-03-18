import React from 'react';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#2d2d2d] text-[#faf8f5] hover:bg-[#4a4a4a] focus:ring-[#2d2d2d]',
    secondary: 'bg-[#ff8a80] text-[#2d2d2d] hover:bg-[#ff9e96] focus:ring-[#ff8a80]',
    outline: 'border-2 border-[#2d2d2d] text-[#2d2d2d] hover:bg-[#2d2d2d] hover:text-[#faf8f5] focus:ring-[#2d2d2d]',
    ghost: 'text-[#2d2d2d] hover:bg-[#2d2d2d]/10 focus:ring-[#2d2d2d]'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>;
}