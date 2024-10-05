/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#CADCFC',  // Add custom light primary color
          DEFAULT: '#8AB6F9', // Default primary color
          dark: '#00246B',    // Add custom dark primary color
        },
        secondary: {
          light: '#EDEDED',  // Add custom secondary light color
          DEFAULT: '#6C6C6C', // Default secondary color
          dark: '#595959',    // Add custom secondary dark color
        },
        customGray: '#CBD5E0', // Example single custom color
      },

    },
  },
  plugins: [],
};
