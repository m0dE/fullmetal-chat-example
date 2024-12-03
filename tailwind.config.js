/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit', // Force JIT mode
  darkMode: 'class', // Use 'class' for toggling dark mode
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
