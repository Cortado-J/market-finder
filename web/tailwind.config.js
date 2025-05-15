/** @type {import('tailwindcss').Config} */
export default {
  // Ensure content paths are correct and comprehensive
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Use a comprehensive safelist for critical classes
  safelist: [
    // Form element classes
    'text-3xl',
    'text-2xl',
    'font-medium',
    'text-gray-700',
    'mb-2',
    'block',
    'w-full',
    'px-3',
    'py-2',
    'bg-white',
    'border',
    'border-gray-300',
    'rounded-md',
    'shadow-sm',
    'focus:outline-none',
    'focus:ring-indigo-500',
    'focus:border-indigo-500',
    'sm:text-sm',
    // Test component classes
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    // Other utility classes
    'text-lg',
    'font-semibold',
    'mb-[1px]',
    'text-green-500',
    'text-6xl',
  ],
  theme: { extend: {} },
  plugins: [],
};