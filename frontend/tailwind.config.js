/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#080818',
        darkCard: '#141430',
        darkSurface: '#1E1E48',
        primary: '#00BFFF',
        primaryDark: '#0088CC',
        secondary: '#7B2FFF',
        accent: '#FF2D78',
        success: '#39FF14',
        danger: '#FF3347',
        warning: '#FFB300',
        textMain: '#D8D8F0',
        textMuted: '#7070A0',
        cardBorder: '#252550',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 10px #00BFFF55',
        'glow-secondary': '0 0 10px #7B2FFF55',
        'glow-accent': '0 0 10px #FF2D7855',
        'glow-success': '0 0 10px #39FF1455',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #0C0C22 0%, #080818 100%)',
      }
    },
  },
  plugins: [],
}