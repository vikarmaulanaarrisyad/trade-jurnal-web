import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0E14",
          card: "#121722",
          cardHover: "#171E2C",
          border: "#1E2638",
          muted: "#64748B",
        },
        trade: {
          profit: "#10B981",
          profitGlow: "rgba(16, 185, 129, 0.2)",
          loss: "#F43F5E",
          lossGlow: "rgba(244, 63, 94, 0.2)",
          buy: "#3B82F6",
          sell: "#EF4444",
          gold: "#F59E0B",
          purple: "#8B5CF6",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(16, 185, 129, 0.2), 0 0 10px rgba(16, 185, 129, 0.1)" },
          "100%": { boxShadow: "0 0 15px rgba(16, 185, 129, 0.4), 0 0 25px rgba(16, 185, 129, 0.2)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
