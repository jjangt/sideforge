/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6C63FF",
          secondary: "#3F3D56",
          accent: "#FF6584",
          background: "#1A1A2E",
          surface: "#16213E",
          text: "#EAEAEA",
          muted: "#8892B0",
        },
      },
    },
  },
  plugins: [],
};
