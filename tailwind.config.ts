import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dk: {
          teal: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            500: "#38bdf8",
            600: "#0ea5e9",
            700: "#0284c7",
            800: "#1e3a8a",
            900: "#1e3a8a",
            950: "#172554",
          },
          orange: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            400: "#38bdf8",
            500: "#38bdf8",
            600: "#0ea5e9",
            700: "#0284c7",
          },
          navy: {
            800: "#1e3a8a",
            900: "#172554",
          },
          gold: {
            400: "#fbbf24",
            500: "#f59e0b",
            600: "#d97706",
          },
        },
        primary: {
          DEFAULT: "#1e3a8a",
          hover: "#172554",
        },
        accent: {
          DEFAULT: "#38bdf8",
          light: "#e0f2fe",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover":
          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
