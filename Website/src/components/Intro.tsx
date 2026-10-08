"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// ── Load animation gate ───────────────────────────────────────────────────────
// The slam-in plays once per browser tab (sessionStorage), and never under
// prefers-reduced-motion. "pending" is the server/first-frame state: everything
// waits in its hidden pose until the client decides "play" or "skip".
export type IntroState = "pending" | "play" | "skip";

const KEY = "p5-intro-played";
const IntroContext = createContext<IntroState>("pending");

// Decided once per page load and cached, so React's dev double-effect can't
// read our own "played" flag back and wrongly skip.
let decided: Exclude<IntroState, "pending"> | null = null;

const decide = (): Exclude<IntroState, "pending"> => {
  if (decided) return decided;
  let played = false;
  try {
    played = sessionStorage.getItem(KEY) === "1";
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Storage blocked (private mode etc.) — just play the intro
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  decided = played || reduce ? "skip" : "play";
  return decided;
};

export function IntroProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IntroState>("pending");
  useEffect(() => setState(decide()), []);
  return <IntroContext.Provider value={state}>{children}</IntroContext.Provider>;
}

export const useIntro = () => useContext(IntroContext);
