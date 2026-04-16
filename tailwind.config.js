/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      // fontFamily: {
      //   helvetica: ['HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'],
      // },
      colors: {
        primary: '#0284c7',
      }
    },
  },
  plugins: [],
}