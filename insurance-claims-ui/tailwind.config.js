/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00D4FF",
        accent: "#00FF94",
        warning: "#FFB800",
        danger: "#FF6B6B",
        dark: {
          900: "#070710",
          800: "#0a0a14",
          700: "#0d0d1a",
          600: "#111120",
          500: "#1a1a2e",
          400: "#1e2040",
        },
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};