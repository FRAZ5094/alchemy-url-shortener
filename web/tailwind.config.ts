import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#0f172a",
        "surface-muted": "#1e293b",
        foreground: "#f1f5f9",
        muted: "#cbd5e1",
        primary: "#67e8f9",
        "primary-muted": "#a5f3fc",
        border: "#1e293b",
      },
    },
  },
} satisfies Config;
