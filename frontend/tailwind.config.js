/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx", "./index.html"],
  theme: {
    extend: {
      colors: {
        principal: {
          orange: 
            {
              400: "#FB923C",
              500: "#431407"
            }
        },
        base: {
          zinc: {
            100: "#F4F4F5",
            300: "#D4D4D8",
            400: "#A1A1AA",
            500: "#71717A",
            800: "#27272A",
            900: "#18181B",
            950: "#09090B"
          }
        }
       },
    },
  },
  plugins: [],
}

