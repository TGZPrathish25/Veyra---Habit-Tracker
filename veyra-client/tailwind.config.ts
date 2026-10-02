import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: 'hsl(252, 87%, 97%)',
          100: 'hsl(252, 87%, 93%)',
          200: 'hsl(252, 87%, 85%)',
          300: 'hsl(252, 87%, 75%)',
          400: 'hsl(252, 87%, 64%)',
          500: 'hsl(252, 87%, 55%)',
          600: 'hsl(252, 87%, 45%)',
          700: 'hsl(252, 87%, 35%)',
          800: 'hsl(252, 87%, 25%)',
          900: 'hsl(252, 87%, 15%)',
        },
        accent: {
          400: 'hsl(173, 80%, 46%)',
          500: 'hsl(173, 80%, 40%)',
        },
        surface: {
          light: 'hsla(0, 0%, 100%, 0.6)',
          dark: 'hsla(225, 25%, 15%, 0.5)',
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '3rem',
        },
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      backdropBlur: {
        glass: '16px',
        'glass-heavy': '24px',
      },
      borderRadius: {
        glass: '16px',
        'glass-sm': '8px',
        'glass-lg': '24px',
      },
      boxShadow: {
        glass: '0 8px 32px hsla(0, 0%, 0%, 0.08)',
        'glass-hover': '0 12px 40px hsla(0, 0%, 0%, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
