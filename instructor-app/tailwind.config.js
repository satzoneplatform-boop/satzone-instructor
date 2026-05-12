/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8247FF",
        secondary: "#100A55",
        ink: "#000929",
        violet: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
        },
        positive: { 50: "#F0FDF4", 100: "#DCFCE7", 500: "#22C55E", 600: "#16A34A" },
        danger: { 50: "#FEF2F2", 100: "#FEE2E2", 500: "#EF4444" },
        warn: { 50: "#FEFCE8", 500: "#FCDD08" },
        sky: { 50: "#EFF6FF" },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: "0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.10)",
        dropdown: "0 10px 30px -5px rgba(16,10,85,0.18), 0 4px 12px -2px rgba(16,10,85,0.08)",
      },
    },
  },
  plugins: [],
};
