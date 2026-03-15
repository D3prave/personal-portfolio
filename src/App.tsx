import { useCallback, useEffect, useState } from "react";
import { AboutSection } from "./components/AboutSection";
import { AmbientField } from "./components/AmbientField";
import { CellField } from "./components/CellField";
import { DeferredSection } from "./components/DeferredSection";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { MotionModeSwitcher } from "./components/MotionModeSwitcher";
import { ScrollProgress } from "./components/ScrollProgress";
import { portfolio } from "./data/portfolio";
import type { MotionMode, PerformanceMode } from "./types/ui";
import {
  hasCoarsePointer,
  isConstrainedPerformanceEnvironment,
  isSafariBrowser,
  prefersReducedMotion,
} from "./utils/performance";

const loadProjectsSection = () =>
  import("./components/ProjectsSection").then((module) => ({
    default: module.ProjectsSection,
  }));
const loadSkillsSection = () =>
  import("./components/SkillsSection").then((module) => ({
    default: module.SkillsSection,
  }));
const loadExperienceSection = () =>
  import("./components/ExperienceSection").then((module) => ({
    default: module.ExperienceSection,
  }));
const loadContactSection = () =>
  import("./components/ContactSection").then((module) => ({
    default: module.ContactSection,
  }));

const MOTION_MODE_STORAGE_KEY = "motion-mode";
const PERFORMANCE_MODE_STORAGE_KEY = "performance-mode";
type ThemeMode = "dark" | "light";

const cellConfig = {
  core: {
    radius: 284,
    push: 10,
    tilt: 5,
  },
  cinematic: {
    radius: 330,
    push: 9,
    tilt: 4,
  },
  experimental: {
    radius: 342,
    push: 13,
    tilt: 7.5,
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
    radius: 232,
    push: 7,
    tilt: 3.2,
  },
} as const;

const rippleDurationByMode = {
  core: 980,
  cinematic: 1180,
  experimental: 920,
} as const;

const sectionHueStops = [198, 28, 338, 160, 46, 274, 210];
const revealFollowByMode = {
  core: {
    follow: 0.52,
    settle: 0.4,
  },
  cinematic: {
    follow: 0.48,
    settle: 0.36,
  },
  experimental: {
    follow: 0.56,
    settle: 0.42,
  },
} as const;

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

function getGradientStateAtProgress(progress: number, sectionCount: number) {
  const clampedProgress = clamp(progress, 0, 1);

  if (sectionCount <= 1) {
    return {
      depth: clampedProgress,
      hue: sectionHueStops[0],
    };
  }

  const lastIndex = sectionCount - 1;
  const scaledProgress = clampedProgress * lastIndex;
  const startIndex = Math.floor(scaledProgress);
  const endIndex = Math.min(startIndex + 1, lastIndex);
  const localProgress = smootherstep(clamp(scaledProgress - startIndex, 0, 1));

  return {
    depth: clampedProgress,
    hue: interpolateHue(
      sectionHueStops[startIndex % sectionHueStops.length],
      sectionHueStops[endIndex % sectionHueStops.length],
      localProgress,
    ),
  };
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

function readInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem("theme");

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return "dark";
}

function readInitialPerformanceMode(): PerformanceMode {
  if (typeof window === "undefined") {
    return "full";
  }

  const storedMode = window.localStorage.getItem(PERFORMANCE_MODE_STORAGE_KEY);

  if (storedMode === "lite" || storedMode === "full") {
    return storedMode;
  }

  return hasCoarsePointer() ? "lite" : "full";
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
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);
  const [motionMode, setMotionMode] = useState<MotionMode>(readInitialMotionMode);
  const [isSafari] = useState(isSafariBrowser);
  const [isConstrainedPerformance] = useState(isConstrainedPerformanceEnvironment);
  const [hasCoarseInput] = useState(hasCoarsePointer);
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(
    readInitialPerformanceMode,
  );
  const [sectionVersion, setSectionVersion] = useState(0);
  const isLitePerformance = performanceMode === "lite";
  const handleDeferredSectionReady = useCallback(() => {
    setSectionVersion((currentVersion) => currentVersion + 1);
  }, []);

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
    let viewportWidth = window.innerWidth;
    let scrollableHeight = Math.max(
      document.documentElement.scrollHeight - viewportHeight,
      1,
    );
    const initialPageProgress =
      scrollableHeight <= 0 ? 0 : clamp(window.scrollY / scrollableHeight, 0, 1);
    const initialGradientState = getGradientStateAtProgress(
      initialPageProgress,
      sections.length,
    );
    let currentProgress = initialPageProgress;
    let targetProgress = initialPageProgress;
    let currentDepth = initialGradientState.depth;
    let targetDepth = currentDepth;
    let currentHue = initialGradientState.hue;
    let targetHue = currentHue;
    let writtenPageProgress = -1;
    let writtenDepth = -1;
    let writtenHue = Number.NaN;

    const updateSectionTargets = (scrollY: number, gradientProgress: number) => {
      if (sections.length === 0) {
        return;
      }

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

      const gradientState = getGradientStateAtProgress(gradientProgress, sections.length);
      targetDepth = gradientState.depth;
      targetHue = gradientState.hue;
    };

    const render = () => {
      const scrollY = window.scrollY;
      const isCompactReveal =
        hasCoarseInput || isLitePerformance || viewportWidth <= 820;
      const isWideReveal = !isCompactReveal && viewportWidth >= 1280;
      const pageProgress =
        scrollableHeight <= 0 ? 0 : clamp(scrollY / scrollableHeight, 0, 1);
      const startLine = viewportHeight * (isCompactReveal ? 1.16 : isWideReveal ? 1.46 : 1.38);
      const endLine = viewportHeight * (isCompactReveal ? 0.78 : isWideReveal ? 0.9 : 0.82);
      const travelDistance = Math.max(
        startLine - endLine,
        viewportHeight * (isCompactReveal ? 0.2 : isWideReveal ? 0.26 : 0.28),
      );
      const isNearPageEnd =
        scrollY + viewportHeight >= document.documentElement.scrollHeight - 6;
      let hasPendingAnimation = false;

      revealItems.forEach((item) => {
        const { delayOffset, height, top } = item;
        const topInViewport = top - scrollY;
        const effectiveDelayOffset = delayOffset * (isCompactReveal ? 0.08 : isWideReveal ? 0.16 : 0.22);
        const baseProgress = clamp(
          (startLine - topInViewport) /
            (travelDistance + height * (isCompactReveal ? 0.02 : isWideReveal ? 0.035 : 0.05)),
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
              ? clamp(adjustedProgress * 1.3, 0, 1)
              : isWideReveal
                ? clamp(adjustedProgress * 1.22, 0, 1)
                : clamp(adjustedProgress * 1.18, 0, 1);
        const targetRevealProgress = smootherstep(finalProgress);
        const revealDelta = targetRevealProgress - item.progress;
        const revealProfile = revealFollowByMode[motionMode];
        const revealFollow = isCompactReveal
          ? 0.42
          : targetRevealProgress > 0.82
            ? revealProfile.settle
            : revealProfile.follow;

        if (
          useDirectScrollSync ||
          targetRevealProgress >= 0.985 ||
          Math.abs(revealDelta) < 0.0012
        ) {
          item.progress = targetRevealProgress;
        } else {
          item.progress += revealDelta * revealFollow;
          hasPendingAnimation = true;
        }

        if (Math.abs(item.progress - item.writtenProgress) > 0.0008) {
          item.element.style.setProperty("--reveal-progress", item.progress.toFixed(3));
          item.writtenProgress = item.progress;
        }

        const nextReady = item.progress > (isCompactReveal ? 0.66 : isWideReveal ? 0.72 : 0.76);

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

      updateSectionTargets(scrollY, currentProgress);

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
        currentHue = (currentHue + hueDelta * 0.06 + 360) % 360;
        hasPendingAnimation = true;
      }

      if (Math.abs(currentProgress - writtenPageProgress) > 0.0008) {
        rootStyle.setProperty("--page-scroll", currentProgress.toFixed(4));
        writtenPageProgress = currentProgress;
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
      viewportWidth = window.innerWidth;
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
    sectionVersion,
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
        theme={theme}
        onToggleTheme={(nextTheme) => {
          syncThemeDocument(nextTheme);
          setTheme(nextTheme);
        }}
        sectionVersion={sectionVersion}
      />
      <MotionModeSwitcher
        mode={motionMode}
        onChange={setMotionMode}
        performanceMode={performanceMode}
        onChangePerformanceMode={setPerformanceMode}
        contactHref={`#${portfolio.contactSection.id}`}
        resumeCta={portfolio.hero.resumeCta}
      />

      <main>
        <HeroSection
          hero={portfolio.hero}
          contactLinks={portfolio.contactSection.contacts}
        />
        <AboutSection about={portfolio.about} />
        <DeferredSection
          section={portfolio.featuredProjectsSection}
          load={loadProjectsSection}
          componentProps={{
            section: portfolio.featuredProjectsSection,
            projects: portfolio.featuredProjects,
            highlightFirst: true,
          }}
          onReady={handleDeferredSectionReady}
        />
        <DeferredSection
          section={portfolio.otherProjectsSection}
          load={loadProjectsSection}
          componentProps={{
            section: portfolio.otherProjectsSection,
            projects: portfolio.otherProjects,
          }}
          onReady={handleDeferredSectionReady}
        />
        <DeferredSection
          section={portfolio.skillsSection}
          load={loadSkillsSection}
          componentProps={{
            section: portfolio.skillsSection,
            cloud: portfolio.skillsCloud,
            skillGroups: portfolio.skillGroups,
            performanceMode,
          }}
          onReady={handleDeferredSectionReady}
        />
        <DeferredSection
          section={portfolio.experienceSection}
          load={loadExperienceSection}
          componentProps={{
            section: portfolio.experienceSection,
            experience: portfolio.experience,
          }}
          onReady={handleDeferredSectionReady}
        />
        <DeferredSection
          section={portfolio.contactSection}
          load={loadContactSection}
          componentProps={{
            contact: portfolio.contactSection,
          }}
          onReady={handleDeferredSectionReady}
        />
      </main>
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
