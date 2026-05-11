import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        iris: '#6D28D9',
        cyan: '#06B6D4',
        magenta: '#EC4899',
        lime: '#84CC16',
        solar: '#F59E0B',
        ink: '#0F172A',
        cloud: '#F8FAFC',
        mist: '#EEF2FF',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        code: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontVariantNumeric: {
        'tabular-nums': 'tabular-nums',
      },
      boxShadow: {
        'cyan-glow': '0 0 12px #06B6D4',
        'lime-glow': '0 0 8px #84CC16',
        'magenta-glow': '0 0 8px #EC4899',
        'iris-glow': '0 0 12px #6D28D9',
      },
      animation: {
        'box-hop': 'box-hop 60ms ease-out',
        'pointer-slide': 'pointer-slide 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'sum-tick': 'sum-tick 220ms ease-out',
        'window-glow': 'window-glow 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'typewriter': 'typewriter 0.05s steps(1) forwards',
      },
      keyframes: {
        'box-hop': {
          '0%': { transform: 'translateY(0) scaleX(1)' },
          '30%': { transform: 'translateY(-8px) scaleX(0.95)' },
          '60%': { transform: 'translateY(0) scaleX(1.05)' },
          '100%': { transform: 'translateY(0) scaleX(1)' },
        },
        'pointer-slide': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(var(--slide-x))' },
        },
        'sum-tick': {
          '0%': { color: 'var(--color-lime)', transform: 'scale(1.2)' },
          '100%': { color: 'inherit', transform: 'scale(1)' },
        },
        'window-glow': {
          '0%, 100%': { boxShadow: '0 0 8px #06B6D4, 0 0 16px #06B6D440' },
          '50%': { boxShadow: '0 0 16px #06B6D4, 0 0 32px #06B6D460' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
