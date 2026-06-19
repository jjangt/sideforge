/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#7C3AED",
          "primary-light": "#A78BFA",
          secondary: "#1E1B4B",
          accent: "#F472B6",
          background: "#0F0A1F",
          surface: "#1A1333",
          "surface-light": "#251E3E",
          text: "#F8FAFC",
          muted: "#94A3B8",
          border: "#2D2654",
          success: "#34D399",
          warning: "#FBBF24",
          error: "#F87171",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: "0 0 20px rgba(124,58,237,0.3)",
        "glow-lg": "0 0 40px rgba(124,58,237,0.4)",
        card: "0 4px 24px rgba(0,0,0,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
    },
  },
  plugins: [],
};
