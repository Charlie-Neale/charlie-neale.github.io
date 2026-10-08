"use client";

import { motion } from "framer-motion";
import React from "react";

export type LetterCfg = {
  letter: string;
  bg?: string;
  color: string;
  border?: string;
  outline?: string;
  rotate: number;
  skewX?: number;
  fontSize?: number;
  padding?: string;
  marginLeft?: string;
  noBox?: boolean;
};

// ── NAV NODE CONFIGS (~23–34px) ───────────────────────────────────────────────

export const PROJECTS_NAV: LetterCfg[] = [
  { letter: 'P', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: -9,  skewX: 3,  fontSize: 28, padding: '4px 7px' },
  { letter: 'R', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: 5,   skewX: -6, fontSize: 25, padding: '3px 6px', marginLeft: '-2px' },
  { letter: 'O', bg: 'var(--red)', color: '#FFF',
    rotate: -3,             fontSize: 23, padding: '6px 10px', marginLeft: '-1px' },
  { letter: 'J', noBox: true, color: '#FFF',
    rotate: 11,  skewX: 4,  fontSize: 30, marginLeft: '-3px' },
  { letter: 'E', bg: '#000', color: '#FFF', border: '#000',
    rotate: -12, skewX: 8,  fontSize: 24, padding: '4px 6px', marginLeft: '-2px' },
  { letter: 'C', bg: '#FFF', color: '#000', border: 'var(--red)', outline: '#000',
    rotate: 7,              fontSize: 27, padding: '6px 12px' },
  { letter: 'T', noBox: true, color: 'var(--red)',
    rotate: -5,             fontSize: 28, marginLeft: '-2px' },
  { letter: 'S', bg: 'var(--red)', color: '#FFF', border: '#000',
    rotate: 14,  skewX: -5, fontSize: 30, padding: '5px 9px', marginLeft: '-4px' },
];

export const EXPERIENCE_NAV: LetterCfg[] = [
  { letter: 'E', bg: '#FFF', color: '#000', border: 'var(--red)',
    rotate: -8,             fontSize: 24, padding: '4px 7px' },
  { letter: 'X', bg: '#000', color: '#FFF', border: 'var(--red)', outline: 'var(--red)',
    rotate: -12, skewX: -4, fontSize: 34, padding: '6px 10px', marginLeft: '-2px' },
  { letter: 'P', noBox: true, color: '#FFF',
    rotate: 6,   skewX: 5,  fontSize: 23, marginLeft: '-1px' },
  { letter: 'E', bg: '#000', color: 'var(--red)', border: '#000',
    rotate: -4,             fontSize: 24, padding: '5px 7px', marginLeft: '-2px' },
  { letter: 'R', bg: '#FFF', color: '#000', border: '#000',
    rotate: 9,   skewX: -7, fontSize: 26, padding: '3px 6px' },
  { letter: 'I', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: -11,            fontSize: 28, padding: '6px 3px', marginLeft: '-2px' },
  { letter: 'E', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: 3,   skewX: 6,  fontSize: 23, padding: '4px 7px' },
  { letter: 'N', noBox: true, color: '#FFF',
    rotate: -7,             fontSize: 26, marginLeft: '-3px' },
  { letter: 'C', bg: '#000', color: '#FFF', border: '#000', outline: 'var(--red)',
    rotate: 5,   skewX: -5, fontSize: 24, padding: '3px 9px' },
  { letter: 'E', bg: 'var(--red)', color: '#FFF', border: '#000',
    rotate: -13,            fontSize: 30, padding: '7px 10px', marginLeft: '-3px' },
];

export const ABOUT_ME_NAV: LetterCfg[] = [
  { letter: 'A', bg: '#FFF', color: 'var(--red)', border: 'var(--red)',
    rotate: -12, skewX: -8, fontSize: 29, padding: '5px 8px' },
  { letter: 'B', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: 5,              fontSize: 26, padding: '4px 8px', marginLeft: '-2px' },
  { letter: 'O', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: -6,  skewX: 5,  fontSize: 24, padding: '5px 9px' },
  { letter: 'U', noBox: true, color: '#FFF',
    rotate: 11,             fontSize: 28, marginLeft: '-3px' },
  { letter: 'T', bg: 'var(--red)', color: '#FFF', border: '#000',
    rotate: -13, skewX: 7,  fontSize: 30, padding: '5px 8px', marginLeft: '-2px' },
  { letter: 'M', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: -8,  skewX: -4, fontSize: 28, padding: '5px 9px', marginLeft: '14px' },
  { letter: 'E', bg: '#FFF', color: 'var(--red)', border: 'var(--red)',
    rotate: 10,             fontSize: 30, padding: '5px 8px', marginLeft: '-2px' },
];

// ── PANEL TITLE CONFIGS (~46–68px, 2× nav size) ───────────────────────────────

export const PROJECTS_PANEL: LetterCfg[] = [
  { letter: 'P', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: -9,  skewX: 3,  fontSize: 56, padding: '8px 14px' },
  { letter: 'R', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: 5,   skewX: -6, fontSize: 50, padding: '6px 12px', marginLeft: '-4px' },
  { letter: 'O', bg: 'var(--red)', color: '#FFF',
    rotate: -3,             fontSize: 46, padding: '12px 20px', marginLeft: '-2px' },
  { letter: 'J', noBox: true, color: '#FFF',
    rotate: 11,  skewX: 4,  fontSize: 60, marginLeft: '-6px' },
  { letter: 'E', bg: '#000', color: '#FFF', border: '#000',
    rotate: -12, skewX: 8,  fontSize: 48, padding: '8px 12px', marginLeft: '-4px' },
  { letter: 'C', bg: '#FFF', color: '#000', border: 'var(--red)', outline: '#000',
    rotate: 7,              fontSize: 54, padding: '12px 24px' },
  { letter: 'T', noBox: true, color: 'var(--red)',
    rotate: -5,             fontSize: 56, marginLeft: '-4px' },
  { letter: 'S', bg: 'var(--red)', color: '#FFF', border: '#000',
    rotate: 14,  skewX: -5, fontSize: 60, padding: '10px 18px', marginLeft: '-8px' },
];

export const EXPERIENCE_PANEL: LetterCfg[] = [
  { letter: 'E', bg: '#FFF', color: '#000', border: 'var(--red)',
    rotate: -8,             fontSize: 48, padding: '8px 14px' },
  { letter: 'X', bg: '#000', color: '#FFF', border: 'var(--red)', outline: 'var(--red)',
    rotate: -12, skewX: -4, fontSize: 68, padding: '12px 20px', marginLeft: '-4px' },
  { letter: 'P', noBox: true, color: '#FFF',
    rotate: 6,   skewX: 5,  fontSize: 46, marginLeft: '-2px' },
  { letter: 'E', bg: '#000', color: 'var(--red)', border: '#000',
    rotate: -4,             fontSize: 48, padding: '10px 14px', marginLeft: '-4px' },
  { letter: 'R', bg: '#FFF', color: '#000', border: '#000',
    rotate: 9,   skewX: -7, fontSize: 52, padding: '6px 12px' },
  { letter: 'I', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: -11,            fontSize: 56, padding: '12px 6px', marginLeft: '-4px' },
  { letter: 'E', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: 3,   skewX: 6,  fontSize: 46, padding: '8px 14px' },
  { letter: 'N', noBox: true, color: '#FFF',
    rotate: -7,             fontSize: 52, marginLeft: '-6px' },
  { letter: 'C', bg: '#000', color: '#FFF', border: '#000', outline: 'var(--red)',
    rotate: 5,   skewX: -5, fontSize: 48, padding: '6px 18px' },
  { letter: 'E', bg: 'var(--red)', color: '#FFF', border: '#000',
    rotate: -13,            fontSize: 60, padding: '14px 20px', marginLeft: '-6px' },
];

export const ABOUT_PANEL: LetterCfg[] = [
  { letter: 'A', bg: '#FFF', color: 'var(--red)', border: 'var(--red)',
    rotate: -12, skewX: -8, fontSize: 58, padding: '10px 16px' },
  { letter: 'B', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: 5,              fontSize: 52, padding: '8px 14px', marginLeft: '-4px' },
  { letter: 'O', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: -6,  skewX: 5,  fontSize: 48, padding: '10px 18px' },
  { letter: 'U', noBox: true, color: '#FFF',
    rotate: 11,             fontSize: 56, marginLeft: '-6px' },
  { letter: 'T', bg: 'var(--red)', color: '#FFF', border: '#000',
    rotate: -13, skewX: 7,  fontSize: 60, padding: '10px 16px', marginLeft: '-4px' },
];

export const ME_PANEL: LetterCfg[] = [
  { letter: 'M', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: -8,  skewX: -4, fontSize: 48, padding: '8px 14px' },
  { letter: 'E', bg: '#FFF', color: 'var(--red)', border: 'var(--red)',
    rotate: 10,             fontSize: 52, padding: '8px 14px', marginLeft: '-4px' },
];

// ── MEDIUM CONFIGS for decorative headers (~38–46px) ─────────────────────────

export const CHARLIE_MEDIUM: LetterCfg[] = [
  { letter: 'C', bg: '#FFF', color: 'var(--red)', border: 'var(--red)',
    rotate: -10,            fontSize: 44, padding: '7px 12px' },
  { letter: 'H', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: 5,   skewX: -4, fontSize: 40, padding: '5px 10px', marginLeft: '-2px' },
  { letter: 'A', noBox: true, color: '#FFF',
    rotate: -8,             fontSize: 46, marginLeft: '-3px' },
  { letter: 'R', bg: 'var(--red)', color: '#FFF',
    rotate: 12,  skewX: 5,  fontSize: 38, padding: '6px 10px', marginLeft: '-2px' },
  { letter: 'L', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: -6,             fontSize: 42, padding: '8px 8px' },
  { letter: 'I', bg: '#000', color: 'var(--red)', border: 'var(--red)',
    rotate: 9,              fontSize: 44, padding: '8px 5px', marginLeft: '-2px' },
  { letter: 'E', noBox: true, color: 'var(--red)',
    rotate: -13, skewX: 6,  fontSize: 40, marginLeft: '-2px' },
];

export const NEALE_MEDIUM: LetterCfg[] = [
  { letter: 'N', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: -7,  skewX: -5, fontSize: 42, padding: '6px 10px' },
  { letter: 'E', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: 10,             fontSize: 38, padding: '5px 9px', marginLeft: '-2px' },
  { letter: 'A', noBox: true, color: '#FFF',
    rotate: -11,            fontSize: 46, marginLeft: '-3px' },
  { letter: 'L', bg: 'var(--red)', color: '#FFF',
    rotate: 6,              fontSize: 40, padding: '7px 8px' },
  { letter: 'E', bg: '#000', color: 'var(--red)', border: '#000',
    rotate: -8,  skewX: 7,  fontSize: 44, padding: '8px 12px', marginLeft: '-3px' },
];

export const CHARLES_MEDIUM: LetterCfg[] = [
  { letter: 'C', bg: '#FFF', color: 'var(--red)', border: 'var(--red)',
    rotate: -10,            fontSize: 44, padding: '7px 12px' },
  { letter: 'H', bg: '#000', color: '#FFF', border: 'var(--red)',
    rotate: 5,   skewX: -4, fontSize: 40, padding: '5px 10px', marginLeft: '-2px' },
  { letter: 'A', noBox: true, color: '#FFF',
    rotate: -8,             fontSize: 46, marginLeft: '-3px' },
  { letter: 'R', bg: 'var(--red)', color: '#FFF',
    rotate: 12,  skewX: 5,  fontSize: 38, padding: '6px 10px', marginLeft: '-2px' },
  { letter: 'L', bg: '#FFF', color: '#000', border: '#000', outline: 'var(--red)',
    rotate: -6,             fontSize: 42, padding: '8px 8px' },
  { letter: 'E', bg: '#000', color: 'var(--red)', border: 'var(--red)',
    rotate: 9,              fontSize: 44, padding: '8px 10px', marginLeft: '-2px' },
  { letter: 'S', noBox: true, color: 'var(--red)',
    rotate: -13, skewX: 6,  fontSize: 40, marginLeft: '-2px' },
];

// ── Component ─────────────────────────────────────────────────────────────────

// Keeps boxed letters readable in every accent theme: white-on-accent follows
// `--on-red` (black on yellow), accent-on-white gets `--accent-stroke`.
const isWhite = (c?: string) => c === '#FFF' || c === '#FFFFFF';
const boxedInk = (cfg: LetterCfg): React.CSSProperties => {
  if (cfg.bg === 'var(--red)' && isWhite(cfg.color)) return { color: 'var(--on-red)' };
  if (cfg.color === 'var(--red)' && isWhite(cfg.bg)) {
    return { color: cfg.color, WebkitTextStroke: 'var(--accent-stroke) #000' };
  }
  return { color: cfg.color };
};

export const LetterLabel = ({
  letterConfigs,
  isHovered = false,
}: {
  letterConfigs: LetterCfg[];
  isHovered?: boolean;
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {letterConfigs.map((cfg, i) => {
        const typo: React.CSSProperties = {
          fontFamily: 'var(--font-oswald)',
          fontWeight: 800,
          fontSize: cfg.fontSize ? `${cfg.fontSize}px` : '26px',
          lineHeight: 1,
          textTransform: 'uppercase',
          userSelect: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        };

        if (cfg.noBox) {
          return (
            <motion.span
              key={i}
              animate={isHovered
                ? { rotate: [cfg.rotate, cfg.rotate + 3, cfg.rotate - 3, cfg.rotate] }
                : { rotate: cfg.rotate }
              }
              transition={isHovered
                ? { duration: 0.2, delay: i * 0.025, ease: 'easeInOut' }
                : { duration: 0 }
              }
              style={{
                ...typo,
                color: cfg.color,
                WebkitTextStroke: '2px #000',
                transform: `skewX(${cfg.skewX ?? 0}deg)`,
                marginLeft: cfg.marginLeft ?? (i > 0 ? '1px' : '0'),
                position: 'relative',
                zIndex: 20 - i,
                padding: cfg.padding ?? '4px 2px',
              }}
            >
              {cfg.letter}
            </motion.span>
          );
        }

        return (
          <motion.span
            key={i}
            animate={isHovered
              ? { rotate: [cfg.rotate, cfg.rotate + 3, cfg.rotate - 3, cfg.rotate] }
              : { rotate: cfg.rotate }
            }
            transition={isHovered
              ? { duration: 0.2, delay: i * 0.025, ease: 'easeInOut' }
              : { duration: 0 }
            }
            style={{
              ...typo,
              background: cfg.bg,
              ...boxedInk(cfg),
              border: cfg.border ? `2px solid ${cfg.border}` : '2px solid transparent',
              outline: cfg.outline ? `2px solid ${cfg.outline}` : undefined,
              outlineOffset: cfg.outline ? '2px' : undefined,
              transform: `skewX(${cfg.skewX ?? 0}deg)`,
              padding: cfg.padding ?? '5px 8px',
              marginLeft: cfg.marginLeft ?? (i > 0 ? '-2px' : '0'),
              position: 'relative',
              zIndex: 20 - i,
            }}
          >
            {cfg.letter}
          </motion.span>
        );
      })}
    </div>
  );
};
