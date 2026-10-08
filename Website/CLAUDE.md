# Persona 5–themed portfolio

Personal portfolio for Charlie Neale (CS student, U of Toronto). Static-exported Next.js site for GitHub Pages, styled after the video game Persona 5: jagged red bolts, per-letter chaos headings, hard offset shadows, parallelogram clip-paths, red crosshair cursor.

## Tech stack

- Next.js `14.2.35`, React 18, TypeScript 5, Tailwind 3.4
- Framer Motion 12 — zoom transitions and spring animations
- Fonts via `@fontsource/*`: Bebas Neue, Oswald (400 + 700), Permanent Marker, Bangers, Rajdhani (500/600/700) — imported in `src/app/layout.tsx:2-9`
- No CSS-in-JS lib; styling = Tailwind utilities + inline `style={}` for chaotic per-letter transforms
- Path alias `@/*` → `src/*` (`tsconfig.json`)

## Build & deploy

- Scripts: `npm run dev | build | start | lint` (`package.json:5-9`)
- `next.config.mjs` sets `output: 'export'` and `images.unoptimized: true` — outputs static HTML to `out/`
- Deploys to a **user GitHub Pages site**. `basePath` is intentionally absent (latest commit `acf8981` removed it). Don't restore it.
- After UI changes: run `npm run build` and verify `out/` renders.

## App structure

- `src/app/layout.tsx` — imports fonts, sets CSS vars (`--font-oswald`, `--font-bebas-neue`, `--font-marker`, `--font-bangers`, `--font-rajdhani`), wraps children in `<InteractiveDotCanvas />` (background) and `<FlashProvider>` (`useFlash()` hook).
- `src/app/page.tsx` — renders only `<ZoomNav />`. Entire UX lives inside that tree.
- `src/app/globals.css` — `html, body { overflow: hidden }` (locked viewport), color tokens, red crosshair cursor, `.p5-scrollbar`, `.p5-heading`.

## Components (`src/components/`)

- **`ZoomNav.tsx`** — root orchestrator. Framer Motion 8× scale to a node origin; fades section panels in/out. `useRef` for stale-closure-safe timers.
- **`HomeMap.tsx`** — canvas-rendered jagged red "victory bolt" (shadow + main bolt) over `<StreetBackdrop />`, with `<BoltFlicker />` between them. Anchors three `<MapNode>` overlays: PROJECTS / EXPERIENCE / ABOUT ME.
- **`StreetBackdrop.tsx`** — three canvases (`useLayerCanvas`, sized from `clientWidth/Height` so transforms don't skew it), each in its own `ParallaxLayer`: shard (+ splatter + cut lines), stars (animated: intro pop + flicker snap), red slab. Hard-edged colour blocks (red slab top-left behind the name, white shard bottom-right). Both keep a black gap from the bolt so it reads as its own section. Inside HomeMap so it zooms with the map. Six Phantom Thieves star bursts (`STAR_BURSTS`, drawn back to front by `drawStarBurst`) bundle on the shard — red/black banded and outline styles, one filling the far bottom-right corner — with white showing around the cluster. **Every star must touch at least one other and the six must form one connected cluster**, at desktop and portrait sizes; re-check after moving any star. Stars are sized from `min(w, h)` so they never stretch, and each has its own `portrait` placement (on tall screens PROJECTS covers the shard's bottom).
- **`BoltFlicker.tsx`** — JS-driven flicker behind the bolt. Every 1.5–4s plays one of five hand-tuned patterns (red / black / white bolt echoes, shuffled rotation, per-burst offset jitter) and throws 3–6 random zigzag sparks off the bolt's vertices. Hard on/off frames, sparks vanish instantly — nothing fades. Idles between bursts; off under `prefers-reduced-motion`.
- **`Intro.tsx`** — `IntroProvider` / `useIntro()`: `"pending" | "play" | "skip"`. The load slam-in plays once per browser tab (`sessionStorage` key `p5-intro-played`) and never under reduced motion. Decision is cached at module level so React's dev double-effect can't make it skip. Everything renders in its hidden pose while `"pending"`.
- **`Parallax.tsx`** — `ParallaxProvider` tracks the mouse (sprung, -1…1); `ParallaxLayer depth={px}` drifts its children opposite the mouse and optionally owns an intro pose (`hidden` / `shown` / `transition`, snapping straight to `shown` on skip). Off on touch screens and reduced motion. Depths: slab & shard 4, bolt 6, stars & ThemeStar 10, name card & nodes 12. Layers are `pointer-events: none` — interactive children must opt back in.
- **Load sequence (first visit per tab)** — slab slams in from the top-left, shard from the bottom-right, bolt ignites (hard on/off/on), stars pop in one by one, name card and nodes spring in.
- **Star snap** — `BoltFlicker` fires `BOLT_BURST_EVENT` at each burst; the stars layer kicks every star 2–5° (alternating direction) and they stay there.
- **`theme.ts`** — accent themes: P5 red `#FF0000` → P3 blue `#0FAAF2` → P4 yellow `#FFE33A`. `cycleTheme()` sets `--red`, `--on-red`, `--accent-stroke` and `data-theme` on `<html>`, then fires `THEME_EVENT` so canvases redraw. Not persisted — every load starts on P5 red.
- **`ThemeStar.tsx`** — invisible round button over the main star (`STAR_BURSTS[MAIN_STAR]`), positioned from the same config via CSS vars (`.theme-star`, portrait set via `@media (orientation: portrait)`). Click = flash + `cycleTheme()`.
- **Name card** (HomeMap) — the name/subtitle/tagline sit on a torn-paper black card (`NAME_CARD_CLIP`) with a white cut-paper offset, so they read over the slab and bolt in every theme. Tagline is accent-coloured; the name has an accent hard shadow.
- **Map nodes** — solid black backing (white inset edge on hover) over an accent offset stamp. Placement is CSS vars on `.map-node` with an optional `portrait` prop (top/left/right/bottom/scale) swapped in by `@media (orientation: portrait)` — no JS layout check, so no flash. On phones EXPERIENCE and ABOUT ME stack on the left.
- **Cut lines** (`CUT_LINES`, `drawCutLine`) — thin white cuts plus tapered slivers in the black gaps (right-middle and bottom-middle), running with the bolt's diagonal. Top-left kept clean.
- **Ink splatter** (`drawSplatter`, `SPLATTERS` in `streetArt.ts`) — blots, drops and tapered streaks thrown off the bottom-right shard's edge: white out of the shard into black, black into the shard (under the stars). The top-left red slab is deliberately splatter-free. Uses `seededRandom` so it's identical every load and only scales with the viewport — change a `seed` to reshuffle one edge, `clusters` for density. Only along colour-area edges, never loose across the page.
- **`streetArt.ts`** — pure canvas helpers (`tracePolygon`, `fillSlab`), the `PALETTE` mirror of the CSS tokens, `VICTORY_BOLT`, and the hand-placed slab point arrays.
- **`LetterLabel.tsx`** — per-letter chaos primitive. Each letter gets its own rotation (-15° to +15°), skew, color, background, border. Sizes: `NAV`, `PANEL`, `MEDIUM`. **Every prominent heading uses this — never replace with plain text.**
- **`SectionPanel.tsx`** — full-screen scrollable wrapper for Projects/Experience/About. Skewed red Back button at top-left, chaos title at top-center.
- **`Projects.tsx`** — 3-col grid of project cards. Reads `content/projects.json`. Pads to 6 with "Coming Soon" placeholders.
- **`Experience.tsx`** — vertical-timeline scaffold. `experienceData = []` currently → renders large rotated "SOON".
- **`About.tsx`** — about-me panel with photo and a "Contact Me" link (there is no separate Contact section).
- **`FlashProvider.tsx`** — React context exposing `useFlash()`. Renders 200ms red overlay (opacity 0.3, `mix-blend-mode: screen`) for the "all-out attack" feel.
- **`InteractiveDotCanvas.tsx`** — fixed background red dot grid (12px spacing, 2px radius; expands to 5.5px within 120px of cursor). Persistent texture — do not remove.

## Content

- `content/projects.json` — array of `{ title, description, tech[], link, image }`.
- **Adding a project = edit this JSON only.** No code changes. UI pads to 6 slots.

## Persona 5 visual idioms — the rules

- **Colors** (`globals.css:13-18`): `--red: #FF0000`, `--black: #000000`, `--white: #FFFFFF`, `--gold: #FFD700`. Pure primaries only, no pastels. Two background-only greys, `--grey-dark: #141414` and `--grey-light: #EDEDED`, sit right next to black/white so they're only noticed up close — use them sparingly for echoes and cut bands, never on text or nodes. Note: `tailwind.config.ts` doesn't expose these — use the CSS vars or raw hex.
- **Clip-paths** — parallelogram skews:
  - Section surfaces: `polygon(5% 0, 100% 0, 95% 100%, 0 100%)`
  - Buttons / map nodes: `polygon(10% 0, 100% 0, 90% 100%, 0 100%)`
  - Match these exact angles for new surfaces.
- **Typography**:
  - Oswald 700 → headings (`.p5-heading`)
  - Bebas Neue → card titles
  - Permanent Marker → handwritten accents (email, signature)
  - Bangers → playful labels
  - Rajdhani → body
  - Reference via `var(--font-*)`.
- **Text effects**: hard offset shadows only — `text-shadow: 3px 3px 0px #000` — and `-webkit-text-stroke` for outlines. **Never blur.** See `.p5-heading` (`globals.css:58-64`).
- **Per-letter chaos rule**: every prominent heading uses `<LetterLabel>`, so no two letters share rotation / skew / colors. The chaos is hand-tuned — do not auto-generate or regularize.
- **Animations**: Framer Motion spring (stiffness 100–150, damping 14–18) for snap. Zoom transitions use asymmetric easing — `[0.4, 0, 1, 1]` on entry, `[0, 0, 0.2, 1]` on exit.
- **Cursor**: red SVG crosshair on every interactive element (`globals.css:31-33`). Adding new interactive elements? Use `<a>`, `<button>`, `<input>`, `<textarea>`, or class `.p5-interactive`.
- **Flash on action**: form submits and project link clicks call `useFlash()`.

## Conventions / what NOT to do

- Don't replace `<LetterLabel>` headings with plain text or auto-generated styles.
- Don't introduce colors outside `--red` / `--black` / `--white` / `--gold` (plus the two background greys).
- **Never hard-code the accent.** `--red` is the theme accent, not always red. In styles use `var(--red)` (text on accent fills: `var(--on-red)`). In canvas code use `PALETTE.red` / `ACCENT` passed through `paint()`, or `currentAccent()`, and redraw on `THEME_EVENT`. Check new UI in all three themes — yellow is the one that breaks contrast.
- Don't add blur, gradients, or rounded corners > 4px. Ambient animations snap on/off, they don't fade (see `BoltFlicker`).
- Don't remove `<InteractiveDotCanvas />` or the bolt flicker — they're the persistent texture.
- Don't restore `basePath` in `next.config.mjs` (user GH Pages site).
- Don't add `images: { domains: [...] }` — `unoptimized: true` is required for static export.
