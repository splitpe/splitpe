/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#e9e1f4',  // Add custom light primary color
          DEFAULT: '#B57EDC', // Default primary color
          dark: '#005271',    // Add custom dark primary color
        },
        // primary: {
        //   light: '#e9e1f4',  // Add custom light primary color
        //   DEFAULT: '#9067C6', // Default primary color
        //   dark: '#005271',    // Add custom dark primary color
        // },


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


//Liked Default 
//colors: {
//   primary: {
//     light: '#8EDFFF',  // Add custom light primary color
//     DEFAULT: '#0075A2', // Default primary color
//     dark: '#00246B',    // Add custom dark primary color
//   },