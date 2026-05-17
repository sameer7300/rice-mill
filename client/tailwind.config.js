/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Newsreader', 'Cormorant Garamond', 'Georgia', 'serif'],
        heritage: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d',
        },
        // Heritage Mill palette
        cream: { DEFAULT: '#f5ede0', 2: '#ede1d0' },
        paddy: { DEFAULT: '#2a4a24', deep: '#19321a', soft: '#486e40', light: '#f0f4ef' },
        saffron: { DEFAULT: '#c8912e', deep: '#a8761e', light: '#fdf4e7' },
        ink: { DEFAULT: '#1a1410', 2: '#3d3028' },
        'rice-muted': '#8a7a6a',
        hairline: '#cfc0af',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      }
    },
  },
  plugins: [],
}
