"use client";

import { motion } from "framer-motion";
import { useFlash } from "./FlashProvider";
import projectsData from "../../content/projects.json";

const TECH_ROTATIONS: Record<string, number> = {
  Python: -3,
  "Scikit-Learn": 2,
  Pandas: -1,
  TypeScript: 3,
  React: -2,
  "Next.js": 1,
  Tailwind: -3,
  JavaScript: 2,
};

const PLACEHOLDER = { title: "Coming Soon", isPlaceholder: true as const };

const allProjects = [
  ...projectsData.map(p => ({ ...p, isPlaceholder: false as const })),
  ...Array(5).fill(null).map(() => ({ ...PLACEHOLDER })),
];

export default function Projects({ direction = "bottom-left" }: { direction?: string }) {
  const { triggerFlash } = useFlash();

  const getInitial = () => {
    switch (direction) {
      case "bottom-left": return { opacity: 0, x: -80, y: 80 };
      case "center":      return { opacity: 0, scale: 0.2 };
      case "top-right":   return { opacity: 0, x: 80, y: -80 };
      default:            return { opacity: 0, y: 50 };
    }
  };

  return (
    <div className="w-full px-6 sm:px-10 relative z-10 mt-4 pb-4">
      <div className="grid grid-cols-3 gap-6">
        {allProjects.map((project, index) => (
          <motion.div
            key={index}
            initial={getInitial()}
            animate={{ opacity: project.isPlaceholder ? 0.6 : 1, x: 0, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.08, type: "spring", stiffness: 100, damping: 15 }}
            whileHover={!project.isPlaceholder ? {
              scale: 1.02,
              boxShadow: "0px 20px 40px color-mix(in srgb, var(--red) 35%, transparent)"
            } : {}}
            className="group relative overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'var(--black)',
              border: '4px solid var(--red)',
              clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)',
            }}
          >
            {/* Header area */}
            {!project.isPlaceholder && 'image' in project && project.image ? (
              <div className="w-full h-40 overflow-hidden relative border-b-4 border-[var(--red)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-[var(--red)] opacity-20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-500" />
              </div>
            ) : (
              <div className="w-full h-40 border-b-4 border-[var(--red)] flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--red) 4%, #000)' }}>
                <span style={{
                  fontFamily: 'var(--font-bebas-neue)',
                  fontSize: '80px',
                  color: 'var(--red)',
                  opacity: 0.2,
                  lineHeight: 1,
                }}>?</span>
              </div>
            )}

            {/* Body */}
            <div className="relative z-10 p-5 flex flex-col flex-grow items-center text-center">
              <h3 style={{
                fontFamily: 'var(--font-oswald)',
                fontWeight: 800,
                fontSize: '18px',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '2px 2px 0px var(--red)',
                marginBottom: '10px',
              }}>
                {project.title}
              </h3>

              {!project.isPlaceholder && 'description' in project ? (
                <>
                  <p className="text-sm text-gray-300 mb-5 leading-relaxed"
                    style={{ fontFamily: 'var(--font-rajdhani)', fontWeight: 500 }}>
                    {project.description}
                  </p>

                  {'tech' in project && project.tech && (
                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                      {project.tech.map((tech, ti) => {
                        const rot = TECH_ROTATIONS[tech] ?? ((ti % 2 === 0 ? -1 : 1) * ((ti % 3) + 1));
                        return (
                          <div key={tech} style={{
                            background: '#000',
                            border: '2px solid var(--red)',
                            transform: `rotate(${rot}deg)`,
                            padding: '3px 8px',
                            display: 'inline-block',
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-oswald)',
                              fontWeight: 600,
                              fontSize: '10px',
                              color: '#FFF',
                              textTransform: 'uppercase',
                              letterSpacing: '1.5px',
                              display: 'block',
                              transform: `rotate(${-rot}deg)`,
                            }}>
                              {tech}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {'link' in project && project.link && (
                    <div className="mt-auto">
                      <motion.a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => triggerFlash()}
                        whileHover={{ x: -3, scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group/btn inline-block"
                        style={{
                          background: '#000',
                          border: '3px solid var(--red)',
                          clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)',
                          padding: '8px 36px',
                          boxShadow: '4px 4px 0px var(--red)',
                        }}
                      >
                        <span style={{
                          fontFamily: 'var(--font-oswald)',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#FFF',
                          textTransform: 'uppercase',
                          letterSpacing: '3px',
                          textShadow: '2px 2px 0px var(--red)',
                          display: 'block',
                          whiteSpace: 'nowrap',
                        }}>
                          VIEW REPO
                        </span>
                        <div className="absolute inset-0 bg-[var(--red)] opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                      </motion.a>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-600 mt-1"
                  style={{ fontFamily: 'var(--font-rajdhani)', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  More to come...
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
