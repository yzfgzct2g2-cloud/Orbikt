/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Orbikt brand palette — calm, professional workspace tones.
        orbit: {
          50: "#eef4ff",
          100: "#dbe6ff",
          500: "#3b6ef5",
          600: "#2f57c9",
          700: "#264aa8",
          900: "#16264f",
        },
      },
    },
  },
  plugins: [],
};
