import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: "#fbf9f4",
        background: "#fbf9f4",
        "on-surface": "#1b1c19",
        "on-surface-variant": "#50443d",
        secondary: "#7d563b",
        "on-secondary": "#ffffff",
        "surface-container": "#f0eee9",
        "surface-container-low": "#f5f3ee",
        "surface-container-high": "#eae8e3",
        "surface-container-highest": "#e4e2dd",
        "surface-container-lowest": "#ffffff",
        "on-primary-container": "#414141",
        "outline-variant": "#d5c3ba",
        outline: "#83746c",
        "tertiary-fixed": "#ece0d7",
        "secondary-fixed": "#ffdcc6",
        "on-secondary-fixed": "#2f1402",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      fontFamily: {
        headline: ["var(--font-newsreader)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        label: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 32px 64px rgba(27, 28, 25, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
