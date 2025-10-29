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
          DEFAULT: '#0088cc',
          dark: '#006699',
          light: '#33a3d9',
        },
        secondary: {
          DEFAULT: '#17a2b8',
          dark: '#138496',
          light: '#45b5c6',
        },
        'own-message': '#dcf8c6',
        'received-message': '#ffffff',
        'chat-bg': '#e5ddd5',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
    },
  },
  plugins: [],
}
