/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      keyframes: {
        slideDown: {
          "0%": { opacity: 0, transform: "translateY(-0.5rem)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-0.5rem)" },
        },
      },
      animation: {
        slideDown: "slideDown 0.3s ease-out forwards",
        slideUp:   "slideUp   0.3s ease-in  forwards",
      },
    },
  },

  // 👇 NEW: aspect-ratio plugin lets us use `aspect-square`
  plugins: [
    require("@tailwindcss/aspect-ratio"),
  ],
};
