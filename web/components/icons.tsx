export const ICON: Record<string, JSX.Element> = {
  recipe: <path d="M4 11h16M6 11a6 6 0 0 1 12 0M8 21h8M12 15v6" />,
  product: <path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v6H5a1 1 0 0 1-1-1v-5zM20 13h-3v6h2a1 1 0 0 0 1-1v-5z" />,
  place: <><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  outfit: <path d="M8 3l4 3 4-3 4 4-3 3v11H7V10L4 7z" />,
  travel: <><path d="M2 12h20" /><circle cx="12" cy="12" r="10" /><path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></>,
  screenshot: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m3 17 5-4 4 3 3-2 6 5" /></>,
};

export const CAT_ICON: Record<string, JSX.Element> = {
  Recipes: ICON.recipe,
  Shopping: <><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></>,
  Travel: ICON.travel,
  Outfits: ICON.outfit,
  "Home ideas": <><path d="M4 11 12 4l8 7M6 10v9h12v-9" /></>,
  "Gift list": <path d="M4 11h16v9H4zM4 7h16v4H4zM12 7V4" />,
  Links: ICON.link,
};

export function Svg({ children, size = 24 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function iconFor(type: string) {
  return ICON[type] ?? ICON.link;
}
