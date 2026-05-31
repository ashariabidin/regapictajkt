/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a2b4e',
        accent: '#e91e63',
        'accent-dark': '#d32f2f',
      },
    },
  },
  plugins: [],
}
