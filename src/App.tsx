import { useEffect, useState } from "react";
import { AboutSection } from "./components/AboutSection";
import { AmbientField } from "./components/AmbientField";
import { CellField } from "./components/CellField";
import { ContactSection } from "./components/ContactSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { MotionModeSwitcher } from "./components/MotionModeSwitcher";
import { ProjectsSection } from "./components/ProjectsSection";
import { ScrollProgress } from "./components/ScrollProgress";
import { SkillsSection } from "./components/SkillsSection";
import { portfolio } from "./data/portfolio";
import type { MotionMode, PerformanceMode } from "./types/ui";
import {
  hasCoarsePointer,
  isConstrainedPerformanceEnvironment,
  isSafariBrowser,
  prefersReducedMotion,
} from "./utils/performance";

const MOTION_MODE_STORAGE_KEY = "motion-mode";
const PERFORMANCE_MODE_STORAGE_KEY = "performance-mode";
type ThemeMode = "dark" | "light";

const pointerConfig = {
  core: {
    follow: 0.18,
    drift: 24,
    soft: -0.24,
    medium: 0.44,
    strong: 0.86,
  },
  cinematic: {
    follow: 0.11,
    drift: 29,
    soft: -0.31,
    medium: 0.38,
    strong: 0.72,
  },
  experimental: {
    follow: 0.29,
    drift: 35,
    soft: -0.18,
    medium: 0.58,
    strong: 1.08,
  },
} as const;

const safariPointerConfig = {
  core: pointerConfig.core,
  cinematic: {
    follow: 0.14,
    drift: 22,
    soft: -0.24,
    medium: 0.34,
    strong: 0.58,
  },
  experimental: {
    follow: 0.22,
    drift: 24,
    soft: -0.12,
    medium: 0.3,
    strong: 0.56,
  },
} as const;

const cellConfig = {
  core: {
    radius: 260,
    push: 11,
    tilt: 6,
  },
  cinematic: {
    radius: 330,
    push: 9,
    tilt: 4,
  },
  experimental: {
    radius: 390,
    push: 18,
    tilt: 11,
  },
} as const;

const safariCellConfig = {
  core: cellConfig.core,
  cinematic: {
    radius: 248,
    push: 7,
    tilt: 3,
  },
  experimental: {
    radius: 238,
    push: 8,
    tilt: 4,
  },
} as const;

const rippleDurationByMode = {
  core: 900,
  cinematic: 1180,
  experimental: 680,
} as const;

const sectionHueStops = [198, 28, 338, 160, 46, 274, 210];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function interpolateHue(from: number, to: number, progress: number) {
  const delta = ((to - from + 540) % 360) - 180;

  return (from + delta * progress + 360) % 360;
}

function smootherstep(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

function readInitialMotionMode(): MotionMode {
  if (typeof window === "undefined") {
    return "core";
  }

  const storedMode = window.localStorage.getItem(MOTION_MODE_STORAGE_KEY);

  if (
    storedMode === "core" ||
    storedMode === "cinematic" ||
    storedMode === "experimental"
  ) {
    return storedMode;
  }

  return "core";
}

function readInitialPerformanceMode(): PerformanceMode {
  if (typeof window === "undefined") {
    return "full";
  }

  const storedMode = window.localStorage.getItem(PERFORMANCE_MODE_STORAGE_KEY);

  if (storedMode === "lite" || storedMode === "full") {
    return storedMode;
  }

  return isConstrainedPerformanceEnvironment() ? "lite" : "full";
}

function syncThemeDocument(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = window.localStorage.getItem("theme");

    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });
  const [motionMode, setMotionMode] = useState<MotionMode>(readInitialMotionMode);
  const [isSafari] = useState(isSafariBrowser);
  const [isConstrainedPerformance] = useState(isConstrainedPerformanceEnvironment);
  const [hasCoarseInput] = useState(hasCoarsePointer);
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(
    readInitialPerformanceMode,
  );
  const isLitePerformance = performanceMode === "lite";

  useEffect(() => {
    const browser = isSafari ? "safari" : "";

    if (browser) {
      document.documentElement.dataset.browser = browser;
    } else {
      delete document.documentElement.dataset.browser;
    }
    document.documentElement.dataset.performance = performanceMode;
  }, [isSafari, performanceMode]);

  useEffect(() => {
    const root = document.documentElement;

    const syncPageVisibility = () => {
      root.dataset.pageVisibility =
        document.visibilityState === "hidden" ? "hidden" : "visible";
    };

    syncPageVisibility();
    document.addEventListener("visibilitychange", syncPageVisibility);

    return () => {
      document.removeEventListener("visibilitychange", syncPageVisibility);
      delete root.dataset.pageVisibility;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const useDirectScrollSync =
      hasCoarseInput ||
      isConstrainedPerformance ||
      isLitePerformance ||
      (isSafari && motionMode === "cinematic");
    const isCompactReveal =
      hasCoarseInput || isLitePerformance || window.innerWidth <= 820;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const sectionElements = Array.from(
      document.querySelectorAll<HTMLElement>("main .section"),
    );
    const revealItems = revealElements.map((element) => {
      const rawDelay = window
        .getComputedStyle(element)
        .getPropertyValue("--reveal-delay")
        .trim();
      const delayMs = rawDelay.endsWith("ms") ? Number.parseFloat(rawDelay) : 0;
      const delayOffset = clamp(delayMs / 640, 0, 0.18);

      return {
        element,
        delayOffset,
        top: 0,
        height: 0,
        progress: 0,
        writtenProgress: -1,
        isReady: false,
      };
    });
    const sections = sectionElements.map((element) => ({
      element,
      top: 0,
      height: 0,
      center: 0,
      progress: -1,
    }));
    const cellItems = Array.from(
      document.querySelectorAll<HTMLElement>(".cell-node-shell"),
    ).map((node) => ({
      node,
      reveal: -1,
      driftY: Number.NaN,
      shimmer: -1,
    }));
    const rootStyle = document.documentElement.style;
    let isMounted = true;
    let animationFrame = 0;
    let measureFrame = 0;
    let viewportHeight = window.innerHeight;
    let scrollableHeight = Math.max(
      document.documentElement.scrollHeight - viewportHeight,
      1,
    );
    let currentProgress = 0;
    let targetProgress = 0;
    let currentDepth = 0;
    let targetDepth = 0;
    let currentHue = sectionHueStops[0];
    let targetHue = currentHue;
    let writtenPageProgress = -1;
    let writtenDepth = -1;
    let writtenHue = Number.NaN;

    const updateSectionTargets = (scrollY: number) => {
      if (sections.length === 0) {
        return;
      }

      const viewportMid = viewportHeight * 0.54;
      const viewportCenter = scrollY + viewportMid;

      sections.forEach((section) => {
        const sectionTop = section.top - scrollY;
        const progress = clamp(
          (viewportHeight * 0.94 - sectionTop) /
            (section.height + viewportHeight * 0.72),
          0,
          1,
        );

        if (Math.abs(progress - section.progress) > 0.0025) {
          section.element.style.setProperty("--section-progress", progress.toFixed(3));
          section.progress = progress;
        }
      });

      if (sections.length === 1) {
        targetDepth = 0;
        targetHue = sectionHueStops[0];
        return;
      }

      if (viewportCenter <= sections[0].center) {
        targetDepth = 0;
        targetHue = sectionHueStops[0];
        return;
      }

      const lastIndex = sections.length - 1;

      if (viewportCenter >= sections[lastIndex].center) {
        targetDepth = 1;
        targetHue = sectionHueStops[lastIndex % sectionHueStops.length];
        return;
      }

      for (let index = 0; index < lastIndex; index += 1) {
        const start = sections[index].center;
        const end = sections[index + 1].center;

        if (viewportCenter < start || viewportCenter > end) {
          continue;
        }

        const localProgress = clamp(
          (viewportCenter - start) / (end - start || 1),
          0,
          1,
        );

        targetDepth = (index + localProgress) / lastIndex;
        targetHue = interpolateHue(
          sectionHueStops[index % sectionHueStops.length],
          sectionHueStops[(index + 1) % sectionHueStops.length],
          localProgress,
        );
        return;
      }
    };

    const render = () => {
      const scrollY = window.scrollY;
      const pageProgress =
        scrollableHeight <= 0 ? 0 : clamp(scrollY / scrollableHeight, 0, 1);
      const startLine = viewportHeight * (isCompactReveal ? 1.08 : 1.28);
      const endLine = viewportHeight * (isCompactReveal ? 0.56 : 0.64);
      const travelDistance = Math.max(
        startLine - endLine,
        viewportHeight * (isCompactReveal ? 0.24 : 0.32),
      );
      const isNearPageEnd =
        scrollY + viewportHeight >= document.documentElement.scrollHeight - 6;
      let hasPendingAnimation = false;

      if (Math.abs(pageProgress - writtenPageProgress) > 0.0008) {
        rootStyle.setProperty("--page-scroll", pageProgress.toFixed(4));
        writtenPageProgress = pageProgress;
      }

      revealItems.forEach((item) => {
        const { delayOffset, height, top } = item;
        const topInViewport = top - scrollY;
        const effectiveDelayOffset = delayOffset * (isCompactReveal ? 0.22 : 0.58);
        const baseProgress = clamp(
          (startLine - topInViewport) /
            (travelDistance + height * (isCompactReveal ? 0.03 : 0.07)),
          0,
          1,
        );
        const adjustedProgress = clamp(
          (baseProgress - effectiveDelayOffset) / (1 - effectiveDelayOffset || 1),
          0,
          1,
        );
        const finalProgress =
          isNearPageEnd && topInViewport < viewportHeight
            ? 1
            : isCompactReveal
              ? clamp(adjustedProgress * 1.2, 0, 1)
              : clamp(adjustedProgress * 1.12, 0, 1);
        const targetRevealProgress = smootherstep(finalProgress);
        const revealDelta = targetRevealProgress - item.progress;
        const revealFollow = isCompactReveal
          ? 0.42
          : targetRevealProgress > 0.82
            ? 0.24
            : 0.34;

        if (useDirectScrollSync || Math.abs(revealDelta) < 0.0012) {
          item.progress = targetRevealProgress;
        } else {
          item.progress += revealDelta * revealFollow;
          hasPendingAnimation = true;
        }

        if (Math.abs(item.progress - item.writtenProgress) > 0.0008) {
          item.element.style.setProperty("--reveal-progress", item.progress.toFixed(3));
          item.writtenProgress = item.progress;
        }

        const nextReady = item.progress > (isCompactReveal ? 0.74 : 0.86);

        if (nextReady !== item.isReady) {
          item.element.classList.toggle("is-reveal-ready", nextReady);
          item.isReady = nextReady;
        }
      });

      targetProgress = pageProgress;

      const cellDelta = targetProgress - currentProgress;

      if (useDirectScrollSync || Math.abs(cellDelta) < 0.0015) {
        currentProgress = targetProgress;
      } else {
        currentProgress += cellDelta * 0.18;
        hasPendingAnimation = true;
      }

      cellItems.forEach((item, index) => {
        const revealProgress = clamp(
          currentProgress * 2.95 - index * 0.055 + 0.22,
          0,
          1,
        );
        const driftY =
          Math.sin(currentProgress * 8 + index * 0.72) * 9 * revealProgress;
        const shimmer = clamp(
          currentProgress * 1.82 - index * 0.036 + 0.14,
          0,
          1,
        );

        if (Math.abs(revealProgress - item.reveal) > 0.0012) {
          item.node.style.setProperty("--cell-scroll-reveal", revealProgress.toFixed(3));
          item.reveal = revealProgress;
        }

        if (Math.abs(driftY - item.driftY) > 0.08) {
          item.node.style.setProperty("--cell-scroll-drift-y", `${driftY.toFixed(2)}px`);
          item.driftY = driftY;
        }

        if (Math.abs(shimmer - item.shimmer) > 0.0012) {
          item.node.style.setProperty("--cell-scroll-shimmer", shimmer.toFixed(3));
          item.shimmer = shimmer;
        }
      });

      updateSectionTargets(scrollY);

      const depthDelta = targetDepth - currentDepth;
      const hueDelta = ((targetHue - currentHue + 540) % 360) - 180;

      if (useDirectScrollSync || Math.abs(depthDelta) < 0.0015) {
        currentDepth = targetDepth;
      } else {
        currentDepth += depthDelta * 0.12;
        hasPendingAnimation = true;
      }

      if (useDirectScrollSync || Math.abs(hueDelta) < 0.08) {
        currentHue = targetHue;
      } else {
        currentHue = (currentHue + hueDelta * 0.1 + 360) % 360;
        hasPendingAnimation = true;
      }

      if (Math.abs(currentDepth - writtenDepth) > 0.0008) {
        rootStyle.setProperty("--section-depth", currentDepth.toFixed(3));
        writtenDepth = currentDepth;
      }

      if (Number.isNaN(writtenHue) || Math.abs(currentHue - writtenHue) > 0.04) {
        rootStyle.setProperty("--section-hue", currentHue.toFixed(2));
        writtenHue = currentHue;
      }

      if (hasPendingAnimation) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      animationFrame = 0;
    };

    const queueRender = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const measureLayout = () => {
      const scrollY = window.scrollY;
      viewportHeight = window.innerHeight;
      scrollableHeight = Math.max(
        document.documentElement.scrollHeight - viewportHeight,
        1,
      );

      revealItems.forEach((item) => {
        const bounds = item.element.getBoundingClientRect();
        item.top = bounds.top + scrollY;
        item.height = bounds.height;
      });

      sections.forEach((section) => {
        const bounds = section.element.getBoundingClientRect();
        section.top = bounds.top + scrollY;
        section.height = bounds.height;
        section.center = section.top + bounds.height * 0.5;
      });

      measureFrame = 0;
      queueRender();
    };

    const scheduleMeasure = () => {
      if (measureFrame !== 0) {
        return;
      }

      measureFrame = window.requestAnimationFrame(measureLayout);
    };

    scheduleMeasure();
    window.addEventListener("scroll", queueRender, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("orientationchange", scheduleMeasure);
    window.addEventListener("load", scheduleMeasure);
    window.addEventListener("lenis-scroll", queueRender);
    window.visualViewport?.addEventListener("resize", scheduleMeasure);

    if ("fonts" in document) {
      void (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => {
        if (isMounted) {
          scheduleMeasure();
        }
      });
    }

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(measureFrame);
      window.removeEventListener("scroll", queueRender);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      window.removeEventListener("load", scheduleMeasure);
      window.removeEventListener("lenis-scroll", queueRender);
      window.visualViewport?.removeEventListener("resize", scheduleMeasure);
    };
  }, [
    hasCoarseInput,
    isConstrainedPerformance,
    isLitePerformance,
    isSafari,
    motionMode,
  ]);

  useEffect(() => {
    syncThemeDocument(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.motionMode = motionMode;
    document.body.dataset.motionMode = motionMode;
    window.localStorage.setItem(MOTION_MODE_STORAGE_KEY, motionMode);
  }, [motionMode]);

  useEffect(() => {
    window.localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, performanceMode);
  }, [performanceMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const reducedMotion = prefersReducedMotion();
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    if (isConstrainedPerformance || isLitePerformance || reducedMotion || !supportsHover) {
      return;
    }

    const spotlightElements = document.querySelectorAll<HTMLElement>(
      ".hover-spotlight",
    );
    let animationFrame = 0;
    let activeElement: HTMLElement | null = null;
    let pendingX = 0;
    let pendingY = 0;

    const renderSpotlight = () => {
      if (activeElement) {
        activeElement.style.setProperty("--spotlight-x", `${pendingX}px`);
        activeElement.style.setProperty("--spotlight-y", `${pendingY}px`);
      }

      animationFrame = 0;
    };

    const queueRender = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(renderSpotlight);
    };

    const handlePointerMove = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const pointerEvent = event as MouseEvent;
      const bounds = target.getBoundingClientRect();
      activeElement = target;
      pendingX = pointerEvent.clientX - bounds.left;
      pendingY = pointerEvent.clientY - bounds.top;
      queueRender();
    };

    const handlePointerLeave = (event: Event) => {
      const target = event.currentTarget as HTMLElement;

      if (activeElement === target) {
        activeElement = null;
      }
    };

    spotlightElements.forEach((element) => {
      element.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      element.addEventListener("pointerleave", handlePointerLeave);
    });

    return () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }

      spotlightElements.forEach((element) => {
        element.removeEventListener("pointermove", handlePointerMove);
        element.removeEventListener("pointerleave", handlePointerLeave);
      });
    };
  }, [isConstrainedPerformance, isLitePerformance]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentModeConfig = (isSafari ? safariPointerConfig : pointerConfig)[motionMode];
    const reducedMotion = prefersReducedMotion();
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    const applyPointer = (x: number, y: number, speed: number) => {
      const shiftX =
        ((x - window.innerWidth * 0.5) / window.innerWidth) *
        currentModeConfig.drift;
      const shiftY =
        ((y - window.innerHeight * 0.5) / window.innerHeight) *
        currentModeConfig.drift;

      document.documentElement.style.setProperty("--page-x", `${x}px`);
      document.documentElement.style.setProperty("--page-y", `${y}px`);
      document.documentElement.style.setProperty(
        "--pointer-speed",
        clamp(speed, 0, 1).toFixed(3),
      );
      document.documentElement.style.setProperty("--bg-shift-x", `${shiftX}px`);
      document.documentElement.style.setProperty("--bg-shift-y", `${shiftY}px`);
      document.documentElement.style.setProperty(
        "--bg-shift-soft-x",
        `${shiftX * currentModeConfig.soft}px`,
      );
      document.documentElement.style.setProperty(
        "--bg-shift-soft-y",
        `${shiftY * currentModeConfig.soft}px`,
      );
      document.documentElement.style.setProperty(
        "--bg-shift-medium-x",
        `${shiftX * currentModeConfig.medium}px`,
      );
      document.documentElement.style.setProperty(
        "--bg-shift-medium-y",
        `${shiftY * currentModeConfig.medium}px`,
      );
      document.documentElement.style.setProperty(
        "--bg-shift-strong-x",
        `${shiftX * currentModeConfig.strong}px`,
      );
      document.documentElement.style.setProperty(
        "--bg-shift-strong-y",
        `${shiftY * currentModeConfig.strong}px`,
      );
    };

    let currentX = window.innerWidth * 0.72;
    let currentY = window.innerHeight * 0.24;
    let targetX = currentX;
    let targetY = currentY;
    let pointerSpeed = 0;

    applyPointer(currentX, currentY, 0);

    if (isConstrainedPerformance || isLitePerformance || reducedMotion || !supportsHover) {
      return;
    }

    let frame = 0;

    const render = () => {
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;
      const velocity = Math.hypot(deltaX, deltaY);

      pointerSpeed += (velocity / 42 - pointerSpeed) * 0.16;
      currentX += deltaX * currentModeConfig.follow;
      currentY += deltaY * currentModeConfig.follow;
      applyPointer(currentX, currentY, pointerSpeed);

      if (Math.abs(deltaX) < 0.35 && Math.abs(deltaY) < 0.35) {
        currentX = targetX;
        currentY = targetY;
        applyPointer(currentX, currentY, pointerSpeed * 0.84);
        frame = 0;
        return;
      }

      frame = window.requestAnimationFrame(render);
    };

    const queueRender = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      queueRender();
    };

    const handleResize = () => {
      currentX = Math.min(currentX, window.innerWidth);
      currentY = Math.min(currentY, window.innerHeight);
      targetX = Math.min(targetX, window.innerWidth);
      targetY = Math.min(targetY, window.innerHeight);
      applyPointer(currentX, currentY, pointerSpeed);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [isConstrainedPerformance, isLitePerformance, isSafari, motionMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const modeConfig = (isSafari ? safariCellConfig : cellConfig)[motionMode];
    const reducedMotion = prefersReducedMotion();
    const supportsHover =
      !hasCoarsePointer() &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cellItems = Array.from(
      document.querySelectorAll<HTMLElement>(".cell-node-shell"),
    ).map((node) => ({
      node,
      centerX: 0,
      centerY: 0,
      react: -1,
      shiftX: Number.NaN,
      shiftY: Number.NaN,
      tilt: Number.NaN,
    }));

    if (
      isConstrainedPerformance ||
      isLitePerformance ||
      reducedMotion ||
      !supportsHover ||
      cellItems.length === 0
    ) {
      return;
    }

    let pointerX = window.innerWidth * 0.62;
    let pointerY = window.innerHeight * 0.38;
    let frame = 0;

    const render = () => {
      cellItems.forEach((item) => {
        const deltaX = pointerX - item.centerX;
        const deltaY = pointerY - item.centerY;
        const distance = Math.hypot(deltaX, deltaY);
        const proximity = clamp(1 - distance / modeConfig.radius, 0, 1);
        const strength = proximity * proximity;
        const normalizedX = distance > 0 ? deltaX / distance : 0;
        const normalizedY = distance > 0 ? deltaY / distance : 0;
        const shift = strength * modeConfig.push;
        const tilt = strength * modeConfig.tilt;

        if (Math.abs(strength - item.react) > 0.0012) {
          item.node.style.setProperty("--cell-react", strength.toFixed(3));
          item.react = strength;
        }

        const shiftX = normalizedX * shift;
        const shiftY = normalizedY * shift;
        const tiltValue = normalizedX * tilt;

        if (Math.abs(shiftX - item.shiftX) > 0.08) {
          item.node.style.setProperty("--cell-shift-x", `${shiftX.toFixed(2)}px`);
          item.shiftX = shiftX;
        }

        if (Math.abs(shiftY - item.shiftY) > 0.08) {
          item.node.style.setProperty("--cell-shift-y", `${shiftY.toFixed(2)}px`);
          item.shiftY = shiftY;
        }

        if (Math.abs(tiltValue - item.tilt) > 0.05) {
          item.node.style.setProperty("--cell-tilt", `${tiltValue.toFixed(3)}deg`);
          item.tilt = tiltValue;
        }
      });

      frame = 0;
    };

    const queueRender = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      queueRender();
    };

    const measureCells = () => {
      cellItems.forEach((item) => {
        item.centerX = item.node.offsetLeft;
        item.centerY = item.node.offsetTop;
      });

      queueRender();
    };

    measureCells();
    queueRender();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", measureCells);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", measureCells);

      cellItems.forEach(({ node }) => {
        node.style.removeProperty("--cell-react");
        node.style.removeProperty("--cell-shift-x");
        node.style.removeProperty("--cell-shift-y");
        node.style.removeProperty("--cell-tilt");
      });
    };
  }, [isConstrainedPerformance, isLitePerformance, isSafari, motionMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const reducedMotion = prefersReducedMotion();
    const supportsHover =
      !hasCoarsePointer() &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cellField = document.querySelector<HTMLElement>(".cell-field");

    if (
      isConstrainedPerformance ||
      isLitePerformance ||
      reducedMotion ||
      !supportsHover ||
      !cellField
    ) {
      return;
    }

    let clickTimeout = 0;

    const createRipple = (x: number, y: number, intensity: number) => {
      const ripple = document.createElement("span");
      const randomOffsetX = (Math.random() - 0.5) * 34 * intensity;
      const randomOffsetY = (Math.random() - 0.5) * 34 * intensity;

      ripple.className = "cell-ripple";
      ripple.style.setProperty("--ripple-x", `${x + randomOffsetX}px`);
      ripple.style.setProperty("--ripple-y", `${y + randomOffsetY}px`);
      ripple.style.setProperty(
        "--ripple-duration",
        `${rippleDurationByMode[motionMode]}ms`,
      );
      ripple.style.setProperty("--ripple-scale", `${(14 + intensity * 8).toFixed(1)}`);
      cellField.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      createRipple(event.clientX, event.clientY, 1);

      if (motionMode === "experimental" && !isSafari) {
        createRipple(event.clientX, event.clientY, 1.25);
      }

      document.documentElement.style.setProperty("--click-energy", "1");
      window.clearTimeout(clickTimeout);
      clickTimeout = window.setTimeout(() => {
        document.documentElement.style.setProperty("--click-energy", "0");
      }, 240);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.clearTimeout(clickTimeout);
      document.documentElement.style.setProperty("--click-energy", "0");
    };
  }, [isConstrainedPerformance, isLitePerformance, isSafari, motionMode]);

  return (
    <div className={`site-shell motion-mode-${motionMode}`}>
      {isConstrainedPerformance || isLitePerformance ? null : <CellField />}
      {isConstrainedPerformance || isLitePerformance ? null : <AmbientField />}
      <ScrollProgress />
      <Header
        brand={portfolio.brand}
        roleLabel={portfolio.roleLabel}
        navigation={portfolio.navigation}
      />
      <MotionModeSwitcher
        mode={motionMode}
        onChange={setMotionMode}
        performanceMode={performanceMode}
        onChangePerformanceMode={setPerformanceMode}
        theme={theme}
        onToggleTheme={(nextTheme) => {
          syncThemeDocument(nextTheme);
          setTheme(nextTheme);
        }}
        contactHref={`#${portfolio.contactSection.id}`}
        resumeCta={portfolio.hero.resumeCta}
      />

      <main>
        <HeroSection
          hero={portfolio.hero}
          contactLinks={portfolio.contactSection.contacts}
        />
        <AboutSection about={portfolio.about} />
        <ProjectsSection
          section={portfolio.featuredProjectsSection}
          projects={portfolio.featuredProjects}
          highlightFirst
        />
        <ProjectsSection
          section={portfolio.otherProjectsSection}
          projects={portfolio.otherProjects}
        />
        <SkillsSection
          section={portfolio.skillsSection}
          cloud={portfolio.skillsCloud}
          skillGroups={portfolio.skillGroups}
          performanceMode={performanceMode}
        />
        <ExperienceSection
          section={portfolio.experienceSection}
          experience={portfolio.experience}
        />
        <ContactSection contact={portfolio.contactSection} />
      </main>

      {isConstrainedPerformance || isLitePerformance ? null : (
        <>
          <div className="cursor-comet" aria-hidden="true" />
          <div className="cursor-trail" aria-hidden="true" />
        </>
      )}

      <footer className="footer">
        <div className="container footer-inner">
          <p>{portfolio.footer.note}</p>
          {portfolio.footer.stack ? <p>{portfolio.footer.stack}</p> : null}
        </div>
      </footer>
    </div>
  );
}

export default App;
