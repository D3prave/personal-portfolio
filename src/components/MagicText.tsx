import { useEffect, useMemo, useState } from "react";
import { prefersReducedMotion } from "../utils/performance";

interface MagicTextProps {
  words: string[];
  interval?: number;
}

export function MagicText({
  words,
  interval = 2600,
}: MagicTextProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReducedMotion] = useState(prefersReducedMotion);
  const longestWord = useMemo(
    () => words.reduce((max, word) => Math.max(max, word.length), 0),
    [words],
  );

  useEffect(() => {
    if (isReducedMotion || words.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % words.length);
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [interval, isReducedMotion, words.length]);

  return (
    <span
      className={`magic-text ${isReducedMotion ? "is-static" : ""}`}
      style={{ ["--magic-text-width" as string]: `${longestWord + 0.6}ch` }}
    >
      <span key={words[activeIndex]} className="magic-text__word">
        {words[activeIndex]}
      </span>
    </span>
  );
}
