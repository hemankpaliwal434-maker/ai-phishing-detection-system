/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midnight-ink': '#0B0B14',
        'deep-indigo': '#1A1B41',
        'lavender': '#9FA8DA',
        'neon-violet': '#7B1FA2',
        'aqua': '#00E5FF',
        'warm-white': '#F5F5F7',
        'glass-bg': 'rgba(26, 27, 65, 0.4)',
        'glass-border': 'rgba(255, 255, 255, 0.08)'
      },
      backgroundImage: {
        'cinematic-gradient': 'radial-gradient(circle at top, #1A1B41 0%, #0B0B14 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-aqua': '0 0 15px rgba(0, 229, 255, 0.3)',
        'glow-violet': '0 0 15px rgba(123, 31, 162, 0.4)'
      }
    },
  },
  plugins: [],
}
