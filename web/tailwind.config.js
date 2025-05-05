/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,css}'],
  safelist: ['text-lg', 'font-semibold', 'mb-[1px]'],
  theme: { extend: {} },
  plugins: [],
};