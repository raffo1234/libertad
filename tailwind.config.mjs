/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      mulish: ["Mulish", "sans-serif"],
      manrope: ["Manrope", "sans-serif"],
    },
    extend: {
      keyframes: {
        scale: {
          "0%": { transform: "scale(0.90)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        scale: "scale 0.4s",
      },
    },
  },
  plugins: [],
};
