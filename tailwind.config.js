/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Trebuchet MS"', '"Segoe UI"', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
