import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#2f5fdb",
          600: "#2549ab",
          700: "#1c3880",
        },
        // Palette del tema scuro: ogni classe `dark:*-neutral-N` nel sito usa
        // questi valori. E' l'unico posto da modificare per cambiare il colore
        // di sfondo/testo/bordi del tema scuro in tutto il sito. Le stesse tinte
        // sono usate anche nelle illustrazioni SVG (hero, chi siamo, servizi):
        // se cambi questi valori, aggiorna anche quelle a mano.
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
