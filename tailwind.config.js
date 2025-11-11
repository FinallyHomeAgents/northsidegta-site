/** @type {import('tailwindcss').Config} */
const brandEmeraldPalette = {
  50:  "#F2F6EB",
  100: "#E2ECCF",
  200: "#C8DDA7",
  300: "#ABC87C",
  400: "#8FB259",
  500: "#6F9940",
  600: "#32610E", // Primary brand green
  700: "#2C560C",
  800: "#22440A", // Dark companion green
  900: "#1A2F06",
  950: "#101E03",
};

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        emerald: brandEmeraldPalette,
        brand: {
          green: "#32610E",
          "green-dark": "#22440A",
        },
      },
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
