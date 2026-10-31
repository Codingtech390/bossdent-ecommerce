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
            50: "#f2edf2",
            100: "#e8dfe9",
            200: "#d9cbd9",
            500: "#a99baa",
            600: "#918594",
            700: "#786b7b",
            800: "#343538", // Primary DentalKart Teal
            900: "#2c2c2e",
            950: "#252526",
          },
          orange: {
            50: "#f4f1ed",
            100: "#eee8ef",
            200: "#ded4df",
            400: "#a99baa",
            500: "#918594", // DentalKart Primary Orange Action
            600: "#786b7b",
            700: "#625765",
          },
          navy: {
            800: "#343538",
            900: "#252522",
          },
          gold: {
            400: "#fbbf24",
            500: "#f59e0b",
            600: "#d97706",
          }
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
        "card-hover": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;