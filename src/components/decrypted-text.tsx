"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type DecryptedTextProps = {
  text: string;
  className?: string;
  encryptedClassName?: string;
  speed?: number;
  iterations?: number;
  triggerKey?: string | number;
};

const defaultCharacters = "TASKWANTED01AI$#";

export function DecryptedText({
  text,
  className,
  encryptedClassName,
  speed = 34,
  iterations = 9,
  triggerKey,
}: DecryptedTextProps) {
  const reduce = useReducedMotion();
  const characters = useMemo(() => defaultCharacters.split(""), []);
  const [displayText, setDisplayText] = useState(text);
  const [revealed, setRevealed] = useState(text.length);
  const visibleText = reduce ? text : displayText;
  const visibleRevealed = reduce ? text.length : revealed;

  useEffect(() => {
    if (reduce) {
      return;
    }

    let count = 0;
    let active = true;

    const timer = window.setInterval(() => {
      count += 1;
      const revealCount = Math.min(
        text.length,
        Math.ceil((count / iterations) * text.length),
      );

      const nextText = text
        .split("")
        .map((char, index) => {
          if (char === " " || index < revealCount) {
            return char;
          }

          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join("");

      if (active) {
        setDisplayText(nextText);
        setRevealed(revealCount);
      }

      if (count >= iterations) {
        window.clearInterval(timer);
        if (active) {
          setDisplayText(text);
          setRevealed(text.length);
        }
      }
    }, speed);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [characters, iterations, reduce, speed, text, triggerKey]);

  return (
    <motion.span
      aria-label={text}
      className={className}
      initial={reduce ? false : { opacity: 0.72 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
    >
      <span aria-hidden="true">
        {visibleText.split("").map((char, index) => (
          <span
            className={index < visibleRevealed ? undefined : encryptedClassName}
            key={`${char}-${index}`}
          >
            {char}
          </span>
        ))}
      </span>
    </motion.span>
  );
}
