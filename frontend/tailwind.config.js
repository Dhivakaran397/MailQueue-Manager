/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#00B04F',
          'green-hover': '#009643',
          'green-light': '#E6F7ED',
          'green-border': '#00B04F',
          gray: '#F3F4F6',
          dark: '#111827'
        }
      }
    },
  },
  plugins: [],
}
