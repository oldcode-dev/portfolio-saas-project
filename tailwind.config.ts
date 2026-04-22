/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      "#040B0F",
        surface: "#081318",
        border:  "#153042",
        accent:  "#00D4FF",
        green:   "#00FF88",
        warn:    "#FF6B35",
        danger:  "#FF3366",
      },
      fontFamily: {
        display: ["Syne", "system-ui"],
        mono:    ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
