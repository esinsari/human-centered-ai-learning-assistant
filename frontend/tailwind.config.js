/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sidebar
        sidebar: '#1e2060',
        // Panel states — match Figma badges
        correct:   '#22c55e',
        incorrect: '#ef4444',
        guidance:  '#7c3aed',
        // Dark right panel background
        panel:     '#2d2d2d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
