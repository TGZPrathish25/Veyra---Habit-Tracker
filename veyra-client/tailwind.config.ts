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
          50: 'hsl(205, 100%, 97%)',
          100: 'hsl(205, 100%, 92%)',
          200: 'hsl(205, 100%, 82%)',
          300: 'hsl(205, 100%, 68%)',
          400: 'hsl(205, 100%, 50%)',
          500: 'hsl(205, 100%, 42%)',
          600: 'hsl(210, 100%, 35%)',
          700: 'hsl(215, 100%, 28%)',
          800: 'hsl(218, 100%, 20%)',
          900: 'hsl(220, 100%, 12%)',
        },
        accent: {
          400: 'hsl(195, 100%, 42%)',
          500: 'hsl(195, 100%, 36%)',
        },
        surface: {
          light: 'hsla(43, 40%, 95%, 0.65)',
          dark: 'hsla(214, 55%, 13%, 0.55)',
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
