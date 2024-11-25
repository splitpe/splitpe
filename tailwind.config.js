/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        poppins: ["Poppins", "sans-serif"], // Set Poppins as the default sans font
        inter: ["Inter", "sans-serif"],
        interBlack: ["InterBlack", "sans-serif"],
        interBold: ["InterBold", "sans-serif"],
        poppinsBold: ["PoppinsBold", "sans-serif"],
        poppinsMedium: ["PoppinsMedium", "sans-serif"],
        poppinsSemiBold: ["PoppinsSemiBold", "sans-serif"],
        narnoor: ["Narnoor", "sans-serif"],
        narnoorBold: ["NarnoorBold", "sans-serif"],
        amaranthRegular: ["AmaranthRegular", "sans-serif"],
        amaranthBold: ["AmaranthBold", "sans-serif"],
        amaranthItalic: ["AmaranthItalic", "sans-serif"],
      },
      colors: {
        primary: {
          light: '#fcf1ff',  // Add custom light primary color
          DEFAULT:'#bd00eb',//'#B57EDC', //'#8b5cf6', //'#B57EDC', // Default primary color
          dark: '#5b2383',//'#260f36',    // Add custom dark primary color
          border: '#f0b2ff',
          tabs: '#f7d6ff',
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
        cgray:{
          one: '#EDEDED',  // Add custom secondary light color
          two: '#6C6C6C', // Default secondary color
          three: '#595959',    // Add custom secondary dark color
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