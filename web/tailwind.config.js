/** @type {import('tailwindcss').Config} */
export default {
  // Basic and simplified content configuration
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Keep safelist minimal but comprehensive
  safelist: [
    // Essential classes
    'text-3xl',
    'text-2xl',
    'text-xl',
    'text-lg',
    'text-sm',
    'font-medium',
    'font-semibold',
    'text-gray-700',
    'text-blue-600',
    'mb-2',
    'mb-6',
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
    // Test component classes
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'h-4',
  ],
  theme: { extend: {} },
  // Disable any experimental features
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Enable strict mode for better error reporting
  mode: 'jit',
};