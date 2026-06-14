/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: '#1B3A57',
          mid: '#2C5468',
        },
        teal: '#7BA8A8',
        gold: '#FCBF2C',
        peach: '#F5C49B',
        brand: {
          green: '#7CB342',
          red: '#C8202F',
          maroon: '#5C1A2B',
        },
        graybar: '#9E9E9E',
        graylight: '#EFEFEF',
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
