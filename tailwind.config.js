/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0f172a',
        indigo: '#4f46e5',
        accentPink: '#f472b6',
        accentPurple: '#a78bfa',
        accentOrange: '#f59e0b',
        accentCyan: '#22d3ee',
        slateLight: '#e2e8f0',
      },
      boxShadow: {
        card: '0 20px 50px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

