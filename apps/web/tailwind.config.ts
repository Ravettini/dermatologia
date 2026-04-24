import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: "#FCFAF7",
        background: "#FCFAF7",
        "on-surface": "#3A3A38",
        "on-surface-variant": "#6B6560",
        secondary: "#8A745D",
        "on-secondary": "#ffffff",
        "surface-container": "#F5F2ED",
        "surface-container-low": "#F2EFE9",
        "surface-container-high": "#EDEBE7",
        "surface-container-highest": "#E8E6E2",
        "surface-container-lowest": "#FFFFFF",
        "on-primary-container": "#414141",
        "outline-variant": "#E5E2DE",
        outline: "#9C9893",
        "tertiary-fixed": "#F2E2DE",
        "secondary-fixed": "#E8E4DD",
        "on-secondary-fixed": "#3A3A38",
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
