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
        // KHAMSIN — "Minimal Saharan Editorial" (see CLAUDE.md §3)
        parchment: '#F1EAD9', // Bone — primary background
        ivory: '#FAF6EF',     // Bleached Bone — lightest bg / product photography backdrop
        ink: '#2A2521',       // Basalt — near-black body text
        sienna: '#B5673A',    // Clay — single warm accent, never more than ~5% of a layout
        taupe: '#9C8563',     // Dune Shadow — mid-tone, borders, secondary text
        'taupe-light': '#C6AE82', // Sand — primary brand tone, secondary surfaces
      },
      fontFamily: {
        // Display (headlines, product names): Fraunces, "Soft" optical size
        serif: ['Fraunces', 'serif'],
        display: ['Fraunces', 'serif'],
        // Body (paragraphs, product copy): Inter / Public Sans
        body: ['Inter', 'sans-serif'],
        // Utility (prices, sizes, captions): Space Mono — numerals/small tags only
        mono: ['Space Mono', 'monospace'],
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