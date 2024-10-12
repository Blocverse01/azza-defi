/** @type {import('tailwindcss').Config} */
import { fontFamily } from "tailwindcss/defaultTheme";

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        subj: ["var(--font-subjectivity)", ...fontFamily.sans],
        inter: ["Inter", " sans-serif"],
      },
      colors: {
        az: {
          primary: {
            green: "#0E231C",
            blue: "#4642E2",
            yellow: "#EAF643",
            black: "#1E1E1E",
          },
          secondary: {
            green: {
              1: "#D3FEB6",
              2: "#EDFFE2",
            },
          },
        },
      },
    },
  },
  plugins: [],
};
