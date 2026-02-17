/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",    // Blue-500
        secondary: "#64748B",  // Slate-500
        accent: "#10B981",     // Emerald-500
        background: "#0F172A", // Slate-900 (Dark mode fallback)
        surface: "#1E293B",    // Slate-800
        danger: "#EF4444"
      }
    },
  },
  plugins: [],
}
