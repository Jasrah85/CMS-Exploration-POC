// tailwind.config.ts  (optional)
import type { Config } from "tailwindcss";

export default <Config>{
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#146EF5",
          dark: "#0F4DB3",
          light: "#E6F0FF",
        },
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
    },
  },
  // v4 autoscans files; no `content` block needed
};
