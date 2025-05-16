import tailwindScrollbarHide from 'tailwind-scrollbar-hide';

/** @type {import('tailwindcss').Config} */
export default {
  plugins: [tailwindScrollbarHide],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist is not needed in most cases with Tailwind v4's just-in-time mode
  // But we'll keep it for development testing
  safelist: [
    // Layout
    'block', 'w-full', 'h-4', 'h-screen', 'overflow-y-auto',
    // Spacing
    'p-4', 'px-3', 'py-2', 'mt-1', 'mt-2', 'mb-2', 'mb-6', 'gap-2', 'space-y-2',
    'top-[22rem]', 'right-5',
    // Typography
    'text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-sm',
    'font-medium', 'font-semibold', 'font-bold',
    'text-gray-600', 'text-blue-600', 'text-gray-700',
    // Backgrounds
    'bg-white', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500',
    'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
    // Borders
    'border', 'border-gray-200', 'border-gray-300', 'rounded-md',
    // Effects
    'shadow-sm', 'shadow-md', 'shadow-lg',
    // Flex & Grid
    'flex', 'flex-col',
    // Position
    'fixed', 'top-20', 'right-5', 'z-50',
  ],
  theme: {
    extend: {
      // Add any custom theme extensions here
    },
  },
  // Enable modern features
  future: {
    hoverOnlyWhenSupported: true,
  },
  // No need for 'mode: jit' in Tailwind v4+ as it's the default
  // Remove any @tailwind directives from your CSS files
};