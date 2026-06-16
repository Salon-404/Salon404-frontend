/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
        },
        dorado: {
          DEFAULT: '#C9913A',
          hover: '#A8752E',
          claro: '#D4A85C',
        },
        crema: '#F9F5F0',
        borde: '#E8DDD0',
        'texto-principal': '#1a0f0a',
        'texto-secundario': '#6B5744',
      },
      fontFamily: {
        sans: ["'Inter'", 'sans-serif'],
        serif: ["'Inter'", 'sans-serif'],
        body: ["'Inter'", 'sans-serif'],
      },
      boxShadow: {
        'elegante': '0 2px 12px rgba(0,0,0,0.06)',
        'elegante-md': '0 4px 16px rgba(0,0,0,0.08)',
        'elegante-lg': '0 8px 24px rgba(0,0,0,0.10)',
      },
      fontSize: {
        'titulo': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'subtitulo': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'cuerpo': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-sec': ['11px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.08em' }],
      },
    },
  },
  plugins: [],
}
