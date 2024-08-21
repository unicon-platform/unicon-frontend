import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter"],
      mono: ["JetBrains Mono"],
    },
  },
  plugins: [],
} satisfies Config;
