/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#fdfbf7",
          100: "#faf5ec",
          200: "#f3e9d2",
        },
        brown: {
          600: "#7c5c3a",
          700: "#6b4f31",
          800: "#5a4228",
        },
        forest: {
          600: "#4a7c59",
          700: "#3d6b4a",
        },
      },
    },
  },
  plugins: [],
}