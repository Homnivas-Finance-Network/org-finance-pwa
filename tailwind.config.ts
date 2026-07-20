import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "surface-1": "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "bg-success": "var(--bg-success)",
        "text-success": "var(--text-success)",
        "border-success": "var(--border-success)",
        "bg-warning": "var(--bg-warning)",
        "text-warning": "var(--text-warning)",
        "border-warning": "var(--border-warning)",
        "bg-accent": "var(--bg-accent)",
        "text-accent": "var(--text-accent)",
        "border-accent": "var(--border-accent)",
        "bg-rev": "var(--bg-rev)",
        "text-rev": "var(--text-rev)",
        "border-rev": "var(--border-rev)",
        "archetype-builder": "var(--archetype-builder)",
        "archetype-saver": "var(--archetype-saver)",
        "archetype-achiever": "var(--archetype-achiever)",
        "archetype-survivor": "var(--archetype-survivor)",
        "archetype-starter": "var(--archetype-starter)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
