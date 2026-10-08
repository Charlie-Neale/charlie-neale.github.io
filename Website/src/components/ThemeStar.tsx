"use client";

import { useState } from "react";
import { useFlash } from "./FlashProvider";
import { MAIN_STAR, STAR_BURSTS } from "./streetArt";
import { THEMES, currentTheme, cycleTheme } from "./theme";

// Invisible button over the main star (drawn on the StreetBackdrop canvas).
// Each click cycles the accent: P5 red → P3 blue → P4 yellow → P5 red.
// Sits inside HomeMap so it moves with the map; placement comes from the same
// star config via CSS vars, with `.theme-star` swapping to the portrait set.
const HIT_SCALE = 0.8; // hit circle covers the star's body, not its outer tips

export default function ThemeStar() {
  const { triggerFlash } = useFlash();
  const [theme, setTheme] = useState(currentTheme().name);
  const star = STAR_BURSTS[MAIN_STAR];
  const next = THEMES[(THEMES.findIndex(t => t.name === theme) + 1) % THEMES.length].name;

  const vars = {
    "--cx": `${star.cx * 100}%`,
    "--cy": `${star.cy * 100}%`,
    "--d": `${star.radius * 2 * HIT_SCALE * 100}vmin`,
    "--pcx": `${star.portrait.cx * 100}%`,
    "--pcy": `${star.portrait.cy * 100}%`,
    "--pd": `${star.portrait.radius * 2 * HIT_SCALE * 100}vmin`,
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className="theme-star"
      style={vars}
      aria-label={`Colour theme: ${theme}. Switch to ${next}`}
      title={`Switch to ${next}`}
      onClick={() => {
        triggerFlash();
        setTheme(cycleTheme().name);
      }}
    />
  );
}
