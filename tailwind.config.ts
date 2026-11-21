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
        // Legacy palette — still used by the tool pages (result, panchang, ...).
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec6ff",
          400: "#59a5ff",
          500: "#3381ff",
          600: "#1b5ff5",
          700: "#1449e1",
          800: "#173cb6",
          900: "#19368f",
          950: "#142257",
        },
        accent: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        maroon: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec6ff",
          400: "#59a5ff",
          500: "#3381ff",
          600: "#1b5ff5",
          700: "#1449e1",
          800: "#173cb6",
          900: "#19368f",
          950: "#142257",
        },
        // Jyotish One dark surface + gold palette.
        ink: {
          950: "#0c0d19",
          900: "#101222",
          850: "#141627",
          800: "#171a2b",
          750: "#1b1e32",
          700: "#202338",
          600: "#262a41",
          500: "#33374f",
          400: "#4a4e66",
          300: "#6f7389",
          200: "#a5a9bf",
          100: "#c5c7d5",
          50: "#f7f5f0",
        },
        gold: {
          100: "#f8ecd2",
          200: "#f1dda9",
          300: "#edc778",
          400: "#e3b45c",
          500: "#d9ad59",
          600: "#b98d3f",
          700: "#8f6a2d",
        },
        iris: {
          200: "#d6cdfa",
          300: "#c2b5f7",
          400: "#ac9af4",
          500: "#8b74ea",
        },
        mint: {
          200: "#c8e6d1",
          400: "#9acba9",
          500: "#6fb884",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      boxShadow: {
        panel: "0 25px 80px rgba(0, 0, 0, 0.35)",
        cta: "0 7px 24px rgba(217, 173, 89, 0.14)",
        toast: "0 10px 40px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "cosmic": "radial-gradient(ellipse at 72% -10%, #313052 0%, rgba(49,48,82,0) 42%)",
        "gold-cta": "linear-gradient(110deg, #f1d28d 0%, #d9ad59 100%)",
        "panel-sheen": "linear-gradient(145deg, #191b2d 0%, #121421 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
