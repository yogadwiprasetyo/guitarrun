/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#15110D',
          60: '#5C544B',
          40: '#8C857A',
          20: '#D8D2C7',
          // legacy shade keys preserved for any older references
          70: '#2a2a2f',
          50: '#5C544B',
          30: '#8C857A',
        },
        paper: '#F5F1EA',
        surface: '#FBF8F2',
        accent: { DEFAULT: '#C2553B', 700: '#A24128' },
        in_tune: '#4B7F4F',
      },
      fontFamily: {
        display: ['"Source Serif 4"', '"Source Serif Pro"', '"Iowan Old Style"', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', '"Source Serif Pro"', '"Iowan Old Style"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
    },
  },
  plugins: [],
}
