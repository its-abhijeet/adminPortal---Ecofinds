/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lora: ["var(--font-lora)", "serif"],
        cursive: ['"Great Vibes"', "cursive"],
      },
      colors: {
        brand: {
          green: "#047857", // Tailwind green-700
          black: "#1F2937", // Tailwind gray-800
        },
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      textShadow: {
        DEFAULT: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const textShadows = theme("textShadow");
      const utilities = {};

      Object.entries(textShadows).forEach(([key, value]) => {
        const className =
          key === "DEFAULT" ? ".text-shadow" : `.text-shadow-${key}`;
        utilities[className] = { textShadow: value };
      });

      addUtilities(utilities);
    },
  ],
};
