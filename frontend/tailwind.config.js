/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#B91C2C', // Primary Deep Blood Red
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#172B3A', // Secondary Dark Navy
          950: '#0e1b26',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F8FA', // Requested Background
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        content: {
          main: '#17212B', // Requested Text
          muted: '#73808C', // Requested Muted text
          subtle: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        emergency: '0 0 15px rgba(185, 28, 44, 0.25)',
      }
    },
  },
  plugins: [],
}

