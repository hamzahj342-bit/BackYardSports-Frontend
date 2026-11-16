/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF5A1F',
          primaryHover: '#FF7A45',
          accent: '#FFC857',
          charcoal: '#111827',
          charcoalDeep: '#0A1220',
          background: '#0A1220',
          offwhite: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#111827',
          muted: '#94A3B8',
          border: '#CBD5E1',
        },
      },
      boxShadow: {
        brand: '0 10px 25px -8px rgba(255, 90, 31, 0.35)',
      },
    },
  },
  plugins: [],
}
