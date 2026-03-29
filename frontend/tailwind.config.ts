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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        heritage: {
          navy: "#00A699",      // Airbnb Babu — teal accent
          saffron: "#FF5A5F",   // Airbnb Rausch — iconic coral red
          bone: "#F7F7F7",      // Airbnb Light — off-white background
          gold: "#767676",      // Airbnb Foggy — medium gray
          onyx: "#484848",      // Airbnb Hof — dark charcoal text
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        "premium": "var(--shadow-premium)",
        "premium-hover": "var(--shadow-premium-hover)",
        "soft-inner": "var(--shadow-soft-inner)",
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
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      transitionTimingFunction: {
        "expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "emil-ease-out": "cubic-bezier(0.23, 1, 0.32, 1)",
        "emil-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
        "emil-in-out-soft": "cubic-bezier(0.4, 0, 0.2, 1)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

