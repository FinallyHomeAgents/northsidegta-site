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
        hoverFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        slideDown: "slideDown 0.3s ease-out forwards",
        slideUp:   "slideUp   0.3s ease-in  forwards",
        hoverFloat: "hoverFloat 6s ease-in-out infinite",
      },
    },
  },

  // 👇 NEW: aspect-ratio plugin lets us use `aspect-square`
  plugins: [
    require("@tailwindcss/aspect-ratio"),
  ],
};
