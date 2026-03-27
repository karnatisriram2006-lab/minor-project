import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "#F8F6F3", // Heritage Off-White
        foreground: "#0B2A4A", // Heritage Navy
        primary: {
          DEFAULT: "#0B2A4A", // Heritage Navy
          foreground: "#F8F6F3",
        },
        secondary: {
          DEFAULT: "#F97316", // Heritage Saffron
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F97316",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#71717A",
          foreground: "#F8F6F3",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0B2A4A",
        },
        heritage: {
          navy: "#0B2A4A",
          saffron: "#F97316",
          cream: "#F8F6F3",
          gold: "#D4AF37",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        lg: "24px",
        md: "16px",
        sm: "12px",
      },
      boxShadow: {
        "soft-sm": "0 2px 4px rgba(0,0,0,0.02)",
        "soft-md": "0 4px 12px rgba(0,0,0,0.05)",
        "soft-lg": "0 8px 24px rgba(0,0,0,0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-soft": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
