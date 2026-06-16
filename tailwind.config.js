/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0D4F4F",
          light: "#1a6b6b",
          dark: "#0a3d3d",
        },
        accent: {
          DEFAULT: "#C9A962",
          light: "#d4bb7e",
          dark: "#b8974e",
        },
      },
      fontFamily: {
        serif: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"SimSun"',
          'Georgia',
          'serif',
        ],
        sans: [
          '"Noto Sans SC"',
          '"Source Han Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out",
        slideUp: "slideUp 0.4s ease-out both",
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
