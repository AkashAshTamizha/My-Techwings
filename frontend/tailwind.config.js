/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette matched to the existing My Tech Wings brand design
        brand: {
          blue: '#2563EB',
          blueDark: '#1D4ED8',
          navy: '#0F172A',
          navyLight: '#1E293B',
          bgHero: '#EAF1FE',
          bgSoft: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
