import { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    '@/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        sm: '576px',
        md: '960px',
        lg: '1440px',
      },
    },
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#121826',
          100: '#0c0f1a',
          200: '#191d2e',
          300: '#232a41',
          400: '#2e364d',
          500: '#384157',
          600: '#424a63',
          700: '#4c546f',
          800: '#565f7b',
          900: '#606987',
        },
        deep_ocean: {
          DEFAULT: '#183d5d',
          100: '#0f2b40',
          200: '#163b5a',
          300: '#1d4b75',
          400: '#24608f',
          500: '#2b75a9',
          600: '#338acc',
          700: '#3b9fe0',
          800: '#45b4f4',
          900: '#50c9ff',
        },
        dusk: {
          DEFAULT: '#4a2c47',
          100: '#2e1b2e',
          200: '#43283e',
          300: '#5a3550',
          400: '#714563',
          500: '#895376',
          600: '#a06289',
          700: '#b9729c',
          800: '#d282b0',
          900: '#eb92c3',
        },
        forest_night: {
          DEFAULT: '#1e2b26',
          100: '#141d1a',
          200: '#1c2a23',
          300: '#26392e',
          400: '#304938',
          500: '#3a5943',
          600: '#44694e',
          700: '#4e7959',
          800: '#588963',
          900: '#62996e',
        },

        background: '#121826',
        foreground: '#d9d9d9',
        primary: {
          DEFAULT: '#183d5d',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#4a2c47',
          foreground: '#e0c5db',
        },
        accent: {
          DEFAULT: '#1e2b26',
          foreground: '#a7d1a3',
        },
        muted: {
          DEFAULT: '#3a5943',
          foreground: '#9db79e',
        },
        border: '#2e364d',
        input: '#3a5943',
        ring: '#24608f',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
