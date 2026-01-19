import React from 'react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {
    value: string;
    label: string;
  }[];
}
export function Select({
  label,
  error,
  options,
  className = '',
  ...props
}: SelectProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5 font-serif">
          {label}
        </label>}
      <select className={`
          w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] 
          text-[#2d2d2d]
          focus:outline-none focus:border-[#2d2d2d] focus:ring-0
          transition-colors duration-200
          disabled:bg-gray-50 disabled:text-gray-500
          appearance-none
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>)}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>;
}