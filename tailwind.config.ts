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
        // New color palette
        nyanza: {
          DEFAULT: '#d6f6dd',
          100: '#114b1d',
          200: '#21973b',
          300: '#3fd55f',
          400: '#8ae59e',
          500: '#d6f6dd',
          600: '#def8e3',
          700: '#e6f9ea',
          800: '#eefbf1',
          900: '#f7fdf8',
        },
        periwinkle: {
          DEFAULT: '#dac4f7',
          100: '#280b4e',
          200: '#50159c',
          300: '#7928e2',
          400: '#aa77ec',
          500: '#dac4f7',
          600: '#e2d0f9',
          700: '#e9dcfa',
          800: '#f0e8fc',
          900: '#f8f3fd',
        },
        salmon_pink: {
          DEFAULT: '#f4989c',
          100: '#48080b',
          200: '#900f16',
          300: '#d81720',
          400: '#ed5159',
          500: '#f4989c',
          600: '#f6aeb1',
          700: '#f9c2c5',
          800: '#fbd6d8',
          900: '#fdebec',
        },
        dun: {
          DEFAULT: '#ebd2b4',
          100: '#412c11',
          200: '#835723',
          300: '#c48334',
          400: '#d9aa71',
          500: '#ebd2b4',
          600: '#efdac2',
          700: '#f3e4d1',
          800: '#f7ede0',
          900: '#fbf6f0',
        },

        // Night mode colors
        night: {
          DEFAULT: '#121212', // Main black
          100: '#000000', // Pure black
          200: '#0a0a0a', // Very dark black
          300: '#121212', // Dark gray (material dark)
          400: '#181818', // Slightly lighter
          500: '#202020', // Medium dark gray
          600: '#282828', // Dark charcoal
          700: '#303030', // Charcoal
          800: '#383838', // Dark slate
          900: '#404040', // Slate gray
        },

        // Theme structure
        background: '#d6f6dd', // nyanza as default background
        foreground: '#280b4e', // periwinkle-100 for contrast

        primary: {
          DEFAULT: '#dac4f7', // periwinkle
          foreground: '#f7fdf8', // nyanza-900
        },

        secondary: {
          DEFAULT: '#f4989c', // salmon_pink
          foreground: '#280b4e', // periwinkle-100
        },

        accent: {
          DEFAULT: '#ebd2b4', // dun
          foreground: '#114b1d', // nyanza-100
        },

        muted: {
          DEFAULT: '#e6f9ea', // nyanza-700
          foreground: '#50159c', // periwinkle-200
        },

        card: {
          DEFAULT: '#f7fdf8', // nyanza-900
          foreground: '#280b4e', // periwinkle-100
        },

        popover: {
          DEFAULT: '#f7fdf8', // nyanza-900
          foreground: '#280b4e', // periwinkle-100
        },

        border: '#8ae59e', // nyanza-400
        input: '#e9dcfa', // periwinkle-700
        ring: '#f6aeb1', // salmon_pink-600

        // Dark mode variants
        dark: {
          background: '#121212', // night-300 for main background
          foreground: '#e0e0e0', // Light gray text for contrast

          primary: {
            DEFAULT: '#282828', // night-600
            foreground: '#e0e0e0', // Light gray text
          },

          secondary: {
            DEFAULT: '#202020', // night-500
            foreground: '#f6aeb1', // salmon_pink-600 for accent
          },

          accent: {
            DEFAULT: '#303030', // night-700
            foreground: '#dac4f7', // periwinkle for contrast
          },

          muted: {
            DEFAULT: '#181818', // night-400
            foreground: '#a0a0a0', // Medium gray text
          },

          card: {
            DEFAULT: '#1a1a1a', // Slightly lighter than background
            foreground: '#e0e0e0', // Light gray text
          },

          popover: {
            DEFAULT: '#1a1a1a', // Slightly lighter than background
            foreground: '#e0e0e0', // Light gray text
          },

          border: '#303030', // night-700
          input: '#202020', // night-500
          ring: '#303030', // night-700
        },

        destructive: {
          DEFAULT: '#900f16', // salmon_pink-200
          foreground: '#fdebec', // salmon_pink-900
        },

        'dark-destructive': {
          DEFAULT: '#ff3b46', // Brighter red for dark mode
          foreground: '#000000', // Pure black for contrast
        },
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
