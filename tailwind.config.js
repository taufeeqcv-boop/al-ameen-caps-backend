/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Al-Ameen Caps Design System
        primary: "#000000",   // Black
        secondary: "#E8DFD2", // Cream - warm earth tone
        accent: "#D4AF37",   // Gold - buttons, borders, price text
        // Optional gold shades for hover states and gradients
        "accent-light": "#E5C158",
        "accent-dark": "#B8962E",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "Lato", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "premium": "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
        "premium-hover": "0 20px 50px -15px rgba(0, 0, 0, 0.2)",
        "btn-gold": "0 4px 14px 0 rgba(212, 175, 55, 0.4)",
        "btn-gold-hover": "0 6px 20px 0 rgba(212, 175, 55, 0.5)",
        "btn-outline": "0 2px 8px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        "route-load": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
      },
      animation: {
        "route-load": "route-load 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
