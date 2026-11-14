/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tomato: { DEFAULT: '#D93A25', dark: '#C4311D' },
        saffron: '#F5B63E',
        basil: { DEFAULT: '#2C6A4A', dark: '#1F4F37', mist: '#E6F1EA' },
        cream: '#FFF8F0',
        peach: '#FFE8D4',
        ink: '#2B1A12',
        muted: '#7A6558',
        line: '#F3E4D3',
        night: { DEFAULT: '#1E1410', 2: '#2D201A', 3: '#3A2A22' },
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
        display: ['Lalezar', 'Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
