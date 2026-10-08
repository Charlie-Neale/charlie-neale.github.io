"use client";

import { motion } from "framer-motion";
import { useFlash } from "./FlashProvider";
import { LetterLabel, CHARLES_MEDIUM, NEALE_MEDIUM } from "./LetterLabel";

// Hand-tuned jagged polygons — irregular torn-paper edges.
// Outer red layer cuts slightly less aggressively than the inner black
// layer, so the red bleeds through at irregular notch positions.
const OUTER_JAG =
  'polygon(' +
  '0% 4%, 5% 0%, 18% 3%, 32% 0%, 50% 5%, 65% 0%, 80% 3%, 95% 0%, 100% 6%,' +
  '96% 22%, 100% 38%, 95% 55%, 100% 72%, 96% 88%, 100% 100%,' +
  '85% 96%, 70% 100%, 55% 95%, 40% 100%, 25% 96%, 10% 100%, 0% 92%,' +
  '4% 75%, 0% 60%, 5% 42%, 0% 28%, 4% 12%' +
  ')';

const INNER_JAG =
  'polygon(' +
  '2% 6%, 8% 2%, 22% 5%, 38% 2%, 52% 7%, 68% 2%, 84% 5%, 97% 3%, 98% 8%,' +
  '94% 26%, 98% 42%, 93% 58%, 98% 75%, 94% 92%, 96% 97%,' +
  '82% 92%, 66% 97%, 50% 92%, 34% 97%, 18% 93%, 4% 96%, 2% 88%,' +
  '6% 72%, 2% 56%, 7% 40%, 2% 24%, 6% 10%' +
  ')';

const PHOTO_CLIP = 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)';
const CHIP_CLIP = 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)';

const SKILLS = [
  'Python', 'NumPy', 'Pandas', 'Streamlit', 'Plotly', 'TypeScript', 'Next.js', 'Git', 'Linux',
];

type InfoRowProps = {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  rotate: number;
  onClickFlash?: () => void;
};

function InfoRow({ label, value, href, external, rotate, onClickFlash }: InfoRowProps) {
  const valueEl = (
    <span
      style={{
        fontFamily: 'var(--font-marker)',
        fontSize: '20px',
        color: '#FFFFFF',
        letterSpacing: '0.5px',
        display: 'inline-block',
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {value}
    </span>
  );

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
      <span
        style={{
          fontFamily: 'var(--font-oswald)',
          fontWeight: 700,
          fontSize: '18px',
          color: 'var(--red)',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          textShadow: '2px 2px 0px #000',
          transform: 'skewX(-8deg)',
          display: 'inline-block',
          minWidth: '110px',
        }}
      >
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          onClick={onClickFlash}
          style={{ textDecoration: 'none' }}
        >
          {valueEl}
        </a>
      ) : (
        valueEl
      )}
    </div>
  );
}

export default function About({ direction = "top-right" }: { direction?: string }) {
  const { triggerFlash } = useFlash();

  const getInitial = () => {
    switch (direction) {
      case "bottom-left": return { opacity: 0, x: -800, y: 800 };
      case "center":      return { opacity: 0, scale: 0.2 };
      case "top-right":   return { opacity: 0, x: 800, y: -800 };
      default:            return { opacity: 0, y: 50 };
    }
  };

  return (
    <div className="w-full px-6 sm:px-12 lg:px-16 relative z-10 flex flex-col items-center">

      <motion.div
        initial={getInitial()}
        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 16 }}
        className="w-full max-w-5xl relative mx-auto"
        style={{ minHeight: '820px' }}
      >
        {/* Outer black drop shadow — anchors the card */}
        <div
          aria-hidden
          className="absolute"
          style={{
            inset: 0,
            transform: 'translate(8px, 8px)',
            background: '#000',
            clipPath: OUTER_JAG,
            zIndex: 0,
          }}
        />

        {/* Red torn-paper layer */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'var(--red)',
            clipPath: OUTER_JAG,
            zIndex: 1,
          }}
        />

        {/* Black inner face — irregular notch positions so red bleeds through */}
        <div
          aria-hidden
          className="absolute"
          style={{
            inset: '10px',
            background: '#000',
            clipPath: INNER_JAG,
            zIndex: 2,
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-8 sm:px-14 py-12 sm:py-16 flex flex-col gap-8">

          {/* Top row: photo + name + description */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 items-center justify-center">

            {/* Photo placeholder */}
            <div
              style={{
                width: '200px',
                height: '240px',
                flexShrink: 0,
                background: '#000',
                border: '4px solid var(--red)',
                clipPath: PHOTO_CLIP,
                position: 'relative',
                transform: 'rotate(-2deg)',
              }}
            >
              <img
                  src="/about/Me.jpg"
                  alt="Charles Neale"
                  className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Name + description */}
            <div className="flex flex-col gap-4 items-center min-w-0">

              {/* CHARLES NEALE — chaos letters */}
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <LetterLabel letterConfigs={CHARLES_MEDIUM} />
                <LetterLabel letterConfigs={NEALE_MEDIUM} />
              </div>

              {/* Description placeholder */}
              <p
                style={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  fontSize: '17px',
                  lineHeight: 1.5,
                  color: '#FFFFFF',
                  opacity: 0.85,
                  marginTop: '8px',
                  maxWidth: '460px',
                  textAlign: 'center',
                }}
              >
                Hi, I am an undergraduate at the University of Toronto studying Computer Science with a Focus on Leadership and Astrophysics. I love all things tech and space and when I'm not at my computer you can find me on stage performing Shakespeare, musicals or jazz trumpet.
              </p>
            </div>

          </div>

          {/* Skewed red divider bar */}
          <div
            aria-hidden
            style={{
              height: '6px',
              background: 'var(--red)',
              clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0 100%)',
              boxShadow: '3px 3px 0px #000',
            }}
          />

          {/* Skills */}
          <div className="flex flex-col gap-4 items-center">
            <h3
              style={{
                fontFamily: 'var(--font-oswald)',
                fontWeight: 700,
                fontSize: '28px',
                color: 'var(--red)',
                textTransform: 'uppercase',
                letterSpacing: '4px',
                textShadow: '3px 3px 0px #000',
                transform: 'skewX(-8deg)',
                margin: 0,
                textAlign: 'center',
              }}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {SKILLS.map((skill, i) => {
                const dark = i % 2 === 0;
                return (
                  <span
                    key={skill}
                    style={{
                      fontFamily: 'var(--font-oswald)',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: dark ? '#FFFFFF' : '#000000',
                      background: dark ? '#000000' : '#FFFFFF',
                      border: '2px solid var(--red)',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      padding: '6px 16px',
                      clipPath: CHIP_CLIP,
                      transform: `rotate(${((i % 3) - 1) * 1.2}deg) skewX(-6deg)`,
                      textShadow: dark ? '2px 2px 0px var(--red)' : 'none',
                      display: 'inline-block',
                    }}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Contact Me */}
          <div className="flex flex-col gap-4 sm:gap-5 items-center">
            <h3
              style={{
                fontFamily: 'var(--font-oswald)',
                fontWeight: 700,
                fontSize: '28px',
                color: 'var(--red)',
                textTransform: 'uppercase',
                letterSpacing: '4px',
                textShadow: '3px 3px 0px #000',
                transform: 'skewX(-8deg)',
                margin: 0,
                textAlign: 'center',
              }}
            >
              Contact Me
            </h3>
            <InfoRow
              label="EMAIL"
              value="charliefneale@outlook.com"
              href="mailto:charliefneale@outlook.com"
              rotate={-1.5}
            />
            <InfoRow
              label="PHONE"
              value="+1 (416) 528-5261"
              href="tel:+14165285261"
              rotate={1}
            />
            <InfoRow
              label="BASED"
              value="Toronto, Ontario, Canada"
              rotate={-1}
            />
            <InfoRow
              label="GITHUB"
              value="github.com/Charlie-Neale"
              href="https://github.com/Charlie-Neale"
              external
              rotate={1.5}
              onClickFlash={triggerFlash}
            />
            <InfoRow
              label="LINKEDIN"
              value="linkedin.com/in/charlie-neale-846305333"
              href="https://www.linkedin.com/in/charlie-neale-846305333/"
              external
              rotate={-1.2}
              onClickFlash={triggerFlash}
            />
          </div>

        </div>
      </motion.div>

    </div>
  );
}
