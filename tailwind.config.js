/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html', './index.html'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fcfaf5',
          100: '#f8f3e5',
          200: '#f0e3c6',
          300: '#e5cda0',
          400: '#dab375',
          500: '#cf984d',
          600: '#c28140',
          700: '#a26535',
          800: '#835231',
          900: '#6a442a',
          950: '#3d2414',
        },
        dark: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#262626',
        }
      },
    },
  },
  plugins: [],
};
