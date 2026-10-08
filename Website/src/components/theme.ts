// ── Accent theme ──────────────────────────────────────────────────────────────
// The site's only themable colour is the accent (P5 red by default). Clicking
// the main star cycles it P5 red → P3 blue → P4 yellow → P5 red.
//
// CSS reads it through `var(--red)` (the name predates theming — it means
// "accent"). Canvas can't read CSS vars, so canvas code passes colours through
// `paint()`, which swaps the ACCENT token for the current hex.

// onAccent: text colour on accent fills (`--on-red`).
// accentStroke: black outline width for accent-coloured text on white
// (`--accent-stroke`) — only yellow needs it to stay readable.
export const THEMES = [
  { name: "Persona 5", accent: "#FF0000", onAccent: "#FFFFFF", accentStroke: "0px" },
  { name: "Persona 3", accent: "#0FAAF2", onAccent: "#FFFFFF", accentStroke: "0px" }, // sampled from P3 Reload key art
  { name: "Persona 4", accent: "#FFE33A", onAccent: "#000000", accentStroke: "1.5px" }, // sampled from P4 Golden key art
] as const;

export const ACCENT = "var(--red)";
export const THEME_EVENT = "accentchange";

let index = 0;

export const currentTheme = () => THEMES[index];
export const currentAccent = () => THEMES[index].accent;

// Resolve a colour for canvas: the ACCENT token becomes the current hex.
export const paint = (color: string) => (color === ACCENT ? currentAccent() : color);

export const cycleTheme = () => {
  index = (index + 1) % THEMES.length;
  const root = document.documentElement;
  root.style.setProperty("--red", currentAccent());
  root.style.setProperty("--on-red", THEMES[index].onAccent);
  root.style.setProperty("--accent-stroke", THEMES[index].accentStroke);
  root.dataset.theme = String(index);
  window.dispatchEvent(new Event(THEME_EVENT));
  return currentTheme();
};
