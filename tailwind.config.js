/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        // Première famille de police
        inter: ['inter', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "orange-crayola": "#ff6b35ff",
        "peach": "#f7c59fff",
        "beige": "#efefd0ff",
        "polynesian-blue": "#004e89ff",
        "lapis-lazuli": "#1a659eff",
        "main-black": "#111",
        "main-white": "#f1f1f1"
      }
    },
  },
  plugins: [],
};
