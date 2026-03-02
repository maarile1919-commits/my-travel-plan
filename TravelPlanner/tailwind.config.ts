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
                "sky-pastel": "#E8F4FD",
                "blue-pastel": "#BFD7EA",
                "blue-mid": "#6BAED6",
                "blue-deep": "#2B7CB8",
                "accent-coral": "#FF8C69",
                "accent-mint": "#7ECAC3",
                "soft-white": "#F7FBFF",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "bounce-dot": "bounceDot 1.2s infinite",
                "pulse-ring": "pulseRing 2s ease-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                bounceDot: {
                    "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
                    "40%": { transform: "scale(1)", opacity: "1" },
                },
                pulseRing: {
                    "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(107,174,214,0.5)" },
                    "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(107,174,214,0)" },
                    "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(107,174,214,0)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
