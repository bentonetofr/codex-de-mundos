import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#05050a',
          900: '#0a0a12',
          800: '#0f0f1a',
          700: '#141422',
          600: '#1a1a2e',
          500: '#20203a',
        },
        amber: {
          DEFAULT: '#c9a84c',
          light: '#e0c16a',
          dark: '#a07c2e',
          glow: 'rgba(201,168,76,0.15)',
        },
        rune: {
          DEFAULT: '#7b5ea7',
          light: '#9b7ec8',
          dark: '#5a4080',
        },
        ash: {
          50: '#f0eefa',
          100: '#e0ddf5',
          200: '#c4bfe8',
          300: '#a8a0dc',
          400: '#8880d0',
          500: '#6b6a80',
          600: '#4a4960',
          700: '#2e2d40',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'amber': '0 0 20px rgba(201,168,76,0.15), inset 0 1px 0 rgba(201,168,76,0.1)',
        'amber-strong': '0 0 40px rgba(201,168,76,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        'inset-border': 'inset 0 0 0 1px rgba(201,168,76,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(201,168,76,0.25)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
