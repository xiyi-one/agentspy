import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        destructive: "hsl(var(--destructive))",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Instrument Sans", "Manrope", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glass: "0 24px 80px rgba(15, 23, 42, 0.10)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.72)",
      },
    },
  },
  plugins: [],
};

export default config;
