import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border-light)",
        input: "rgba(255, 255, 255, 0.04)",
        ring: "var(--primary-glow)",
        background: "var(--bg-deep)",
        foreground: "var(--text-main)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1e293b",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#0a0a16",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "rgba(22, 22, 38, 0.6)",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "calc(var(--radius-md) - 4px)",
      },
    },
  },
  plugins: [tailwindAnimate],
}

