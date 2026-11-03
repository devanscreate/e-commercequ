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
        primary: {
          DEFAULT: "#0F172A", // Slate 900
          dark: "#020617",
          light: "#1E293B",
        },
        background: "#F8FAFC", // Slate 50
        surface: "#FFFFFF",
        accent: {
          DEFAULT: "#2563EB", // Royal Blue
          hover: "#1D4ED8",
        },
        success: {
          DEFAULT: "#22C55E", // Emerald Green
          hover: "#16A34A",
        },
      },
    },
  },
  plugins: [],
};
export default config;

