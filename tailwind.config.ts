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
        parchment: '#F0E9DF',
        ivory: '#FAF6F0',
        ink: '#1C1917',
        sienna: '#A8401A',
        taupe: '#BEB0A0',
        'taupe-light': '#D9CFC4',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        display: ['Bebas Neue', 'sans-serif'],
        mono: ['Instrument Mono', 'monospace'],
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config