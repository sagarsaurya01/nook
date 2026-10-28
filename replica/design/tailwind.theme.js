// Drop into tailwind.config.js -> theme.extend. Components then use
// bg-surface / text-muted / rounded-md, never raw hex. Values come from
// the CSS variables in tokens.css so /replica-brand changes one file.
module.exports = {
  colors: {
    bg: "var(--bg)",
    surface: "var(--surface)",
    border: "var(--border)",
    "border-input": "var(--border-input)",
    text: "var(--text)",
    muted: "var(--text-muted)",
    accent: "var(--accent)",
    "on-accent": "var(--on-accent)",
    danger: "var(--danger)",
    success: "var(--success)",
    warning: "var(--warning)",
  },
  fontFamily: {
    sans: "var(--font-sans)",
    serif: "var(--font-serif)",
    mono: "var(--font-mono)",
  },
  fontSize: {
    xs: ["12px", { lineHeight: "16px", fontWeight: "500" }],
    sm: ["14px", { lineHeight: "20px" }],
    base: ["16px", { lineHeight: "24px" }],
    lg: ["20px", { lineHeight: "28px", fontWeight: "600" }],
    xl: ["28px", { lineHeight: "34px", fontWeight: "700" }],
    display: ["40px", { lineHeight: "46px", fontWeight: "800" }],
  },
  borderRadius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    pill: "var(--radius-pill)",
  },
  boxShadow: {
    card: "var(--shadow-card)",
    pop: "var(--shadow-pop)",
  },
  maxWidth: { content: "1120px" },
};
