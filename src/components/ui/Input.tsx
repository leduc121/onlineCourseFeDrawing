import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5 font-serif">
          {label}
        </label>}
      <input className={`
          w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] 
          text-[#2d2d2d] placeholder-gray-400
          focus:outline-none focus:border-[#2d2d2d] focus:ring-0
          transition-colors duration-200
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>;
}