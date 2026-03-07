/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        secondary: '#06B6D4',
        accent: '#14B8A6',
        success: '#34D399',
        warm: '#FBBF24',
      },
    },
  },
  plugins: [],
}
