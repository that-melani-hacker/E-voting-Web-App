/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
      },
      boxShadow: {
        soft: "0 20px 40px rgba(21, 83, 45, 0.12)",
      },
    },
  },
  plugins: [],
};

