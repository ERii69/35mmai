/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pro: {
          primary: "#C8102E",
          cinematic: "#C8102E",
          "cinematic-bright": "#E30613",
          /** Premium film accent — marketing, tier badges, hero highlights */
          accent: "#FBBF24",
          "accent-bright": "#FCD34D",
          "accent-muted": "#D97706",
          secondary: "#3A3A3C",
          success: "#30D158",
          warning: "#FF9F0A",
          text: "#F5F5F7",
          "text-secondary": "#B4B4BA",
          base: "#0f0f0f",
          elevated: "#1a1a1a",
          surface: "#111111",
          muted: "#0d0d0d",
        },
      },
      fontFamily: {
        cinema: ["var(--font-cinema)", "Barlow Condensed", "system-ui", "sans-serif"],
      },
      maxWidth: {
        pro: "80rem", // 1280px
      },
    },
  },
  plugins: [],
}