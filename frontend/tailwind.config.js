/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E85D26',
          50: '#FEF2EC',
          100: '#FDDFC9',
          500: '#E85D26',
          600: '#CC5122',
          700: '#B0451E',
        },
        'vet-green': {
          DEFAULT: '#1B5E20',
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#1B5E20',
          600: '#155218',
        },
      },
    },
  },
  plugins: [],
}
