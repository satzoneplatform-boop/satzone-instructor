/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ─── satzone.dev brand palette (primary = brand-500) ───────────────
        primary:   "#615fff",   // satzone brand-500
        secondary: "#314158",   // satzone ink-700  (main body/ui text)
        ink:       "#0f172b",   // satzone ink-900  (headings / darkest text)

        // violet tokens — map to satzone brand scale so all violet-* classes
        // automatically pick up the new palette throughout the codebase
        violet: {
          50:  "#eef0ff",   // brand-50
          100: "#e0e1ff",   // brand-100
          200: "#c5c5ff",   // brand-200
          300: "#a3b3ff",   // brand-300
          400: "#7c86ff",   // brand-400
          500: "#615fff",   // brand-500
          600: "#4f39f6",   // brand-600
        },

        // slate tokens — map to satzone ink scale
        slate: {
          50:  "#f8fafc",   // ink-50  (page background)
          100: "#f1f5f9",   // ink-100
          200: "#dde3eb",   // ink-200
          300: "#cad5e2",   // ink-300
          400: "#90a1b9",   // ink-400
          500: "#62748e",   // ink-500
          600: "#45556c",   // ink-600
          700: "#314158",   // ink-700
        },

        // Semantic status colours matching satzone's success/danger/warn
        positive: {
          50:  "#ecfdf3",
          100: "#ecfdf3",
          500: "#22c55e",   // success-500
          600: "#049228",   // success-600
        },
        danger: {
          50:  "#fdf4f3",
          100: "#fdf4f3",
          500: "#d54033",   // danger-500
        },
        warn: {
          50:  "#fffbeb",
          500: "#f59e0b",   // warn-500 (amber, not yellow)
        },
        sky: { 50: "#eff6ff" },
      },

      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        // satzone card and dropdown shadows
        card:     "0 1px 2px 0 rgba(15,23,43,0.04), 0 1px 3px 0 rgba(15,23,43,0.05)",
        dropdown: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(15,23,43,0.10)",
        glow:     "0 0 24px rgba(97,95,255,0.25)",
      },

      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        "fade-in": "fadeIn 0.4s ease-out both",
        "blob":    "blob 9s ease-in-out infinite",
      },

      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%":      { transform: "translate(40px, -30px) scale(1.08)" },
          "66%":      { transform: "translate(-25px, 22px) scale(0.94)" },
        },
      },
    },
  },
  plugins: [],
};
