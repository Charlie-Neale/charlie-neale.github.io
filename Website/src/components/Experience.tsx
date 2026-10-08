"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

type CategoryKey = "work" | "awards" | "qualifications" | "education";

type ExperienceItem = {
  title: string;
  year?: string;
  image?: string;
  isPlaceholder?: boolean;
};

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "work",           label: "WORK" },
  { key: "awards",         label: "AWARDS" },
  { key: "qualifications", label: "QUALIFICATIONS" },
  { key: "education",      label: "EDUCATION" },
];

// Drop image files into /public/<category>/ — paths below resolve from there.
// e.g. public/education/uoft.png  →  src="/education/uoft.png"
const DATA: Record<CategoryKey, ExperienceItem[]> = {
  work: [
    { title: "Junior Deep Engineering Outreach", year: "2026",      image: "/work/jdeo.png" },
    { title: "St M's Gym",                       year: "2024-2025", image: "/work/st-marys-gym.jpeg" },
  ],
  awards: [
    { title: "School Captain",                  year: "2024-2025", image: "/awards/school-captain.JPG" },
    { title: "Design & Technology Scholarship", year: "2023-2025", image: "/awards/dt-scholarship.png" },
  ],
  qualifications: [
    { title: "ILM Level 3 Leadership Qualification", year: "2024", image: "/qualifications/ilm.png" },
    { title: "Coming Soon", isPlaceholder: true },
  ],
  education: [
    { title: "University of Toronto",   year: "2025-Current", image: "/education/uoft.png" },
    { title: "Kingston Grammar School", year: "2018-2025",    image: "/education/kingston-grammar.jpg" },
  ],
};

const PLACEHOLDER_COUNT = 4;

type DisplayItem = ExperienceItem & { isPlaceholder: boolean };

function getDisplayItems(items: ExperienceItem[]): DisplayItem[] {
  if (items.length === 0) {
    return Array(PLACEHOLDER_COUNT).fill(null).map(() => ({
      title: "Coming Soon",
      isPlaceholder: true,
    }));
  }
  return items.map(i => ({ ...i, isPlaceholder: i.isPlaceholder ?? false }));
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export default function Experience({ direction = "bottom-left" }: { direction?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideDirection = useRef(0);
  const prevIndex = useRef(0);

  const handleSelect = (next: number) => {
    if (next === activeIndex) return;
    slideDirection.current = next > prevIndex.current ? 1 : -1;
    prevIndex.current = next;
    setActiveIndex(next);
  };

  const getInitial = () => {
    switch (direction) {
      case "bottom-left": return { opacity: 0, x: -80, y: 80 };
      case "center":      return { opacity: 0, scale: 0.2 };
      case "top-right":   return { opacity: 0, x: 80, y: -80 };
      default:            return { opacity: 0, y: 50 };
    }
  };

  const activeKey = CATEGORIES[activeIndex].key;
  const items = getDisplayItems(DATA[activeKey]);
  const gridClass = "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto";

  return (
    <div className="w-full px-6 sm:px-10 relative z-10 mt-4 pb-4">

      {/* Toggle bar */}
      <motion.div
        initial={getInitial()}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 16 }}
        className="flex flex-wrap justify-center gap-3 sm:gap-5 mb-10"
      >
        {CATEGORIES.map((cat, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.button
              key={cat.key}
              onClick={() => handleSelect(i)}
              whileHover={{ x: -3, scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="relative group"
              style={{
                background: isActive ? 'var(--red)' : '#000',
                border: isActive ? '3px solid #000' : '3px solid var(--red)',
                clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)',
                padding: '10px 36px',
                boxShadow: isActive ? '4px 4px 0px #000' : '4px 4px 0px var(--red)',
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-oswald)',
                fontWeight: 700,
                fontSize: '15px',
                color: '#FFF',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: isActive ? '2px 2px 0px #000' : '2px 2px 0px var(--red)',
                display: 'block',
                whiteSpace: 'nowrap',
              }}>
                {cat.label}
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Sliding grid */}
      <div className="relative overflow-x-hidden">
        <AnimatePresence mode="wait" custom={slideDirection.current} initial={false}>
          <motion.div
            key={activeKey}
            custom={slideDirection.current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className={gridClass}
          >
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: item.isPlaceholder ? 0.6 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06, type: "spring", stiffness: 110, damping: 15 }}
                className="group relative overflow-hidden flex flex-col"
                style={{
                  backgroundColor: 'var(--black)',
                  border: '4px solid var(--red)',
                  clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)',
                }}
              >
                {item.image ? (
                  <div className="w-full h-56 overflow-hidden relative border-b-4 border-[var(--red)] flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--red) 4%, #000)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-[var(--red)] opacity-15 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-500" />
                  </div>
                ) : (
                  <div
                    className="w-full h-40 border-b-4 border-[var(--red)] flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--red) 4%, #000)' }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-bebas-neue)',
                      fontSize: '80px',
                      color: 'var(--red)',
                      opacity: 0.2,
                      lineHeight: 1,
                    }}>?</span>
                  </div>
                )}

                <div className="relative z-10 p-5 flex flex-col flex-grow items-center text-center">
                  <h3 style={{
                    fontFamily: 'var(--font-oswald)',
                    fontWeight: 800,
                    fontSize: '20px',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    textShadow: '2px 2px 0px var(--red)',
                    marginBottom: '10px',
                  }}>
                    {item.title}
                  </h3>

                  {item.year ? (
                    <span style={{
                      fontFamily: 'var(--font-bangers)',
                      fontSize: '24px',
                      color: 'var(--red)',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                    }}>
                      {item.year}
                    </span>
                  ) : (
                    <p
                      className="text-xs text-gray-600 mt-1"
                      style={{
                        fontFamily: 'var(--font-rajdhani)',
                        fontWeight: 500,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                      }}
                    >
                      More to come...
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
