/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        warm: {
          beige: '#F5F1EB',
          cream: '#FAF8F3',
          brown: '#8B6F47',
          'brown-light': '#A68B5B',
        },
      },
    },
  },
  plugins: [],
}

