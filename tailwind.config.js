/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ufrpe: {
          blue: {
            50: '#eef5fc',
            100: '#d5e6f8',
            200: '#b0d1f3',
            300: '#7cb3eb',
            400: '#4391e0',
            500: '#1b74d4',
            600: '#005bb5',
            700: '#004791',
            800: '#003366', // Azul Oficial UFRPE
            900: '#002042',
          },
          green: {
            50: '#effaf2',
            100: '#d7f2df',
            200: '#b3e5c4',
            300: '#82d2a1',
            400: '#4eb77a',
            500: '#2d9c5b',
            600: '#1e7e45',
            700: '#006633', // Verde Oficial UFRPE
            800: '#004f27',
            900: '#00381c',
          },
          gold: {
            500: '#e5a823',
            600: '#cc8d11',
          }
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
