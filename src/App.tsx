import { useEffect, useState } from "react";
import { AboutSection } from "./components/AboutSection";
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
  shouldUseNativeScroll,
} from "./utils/performance";

const MOTION_MODE_STORAGE_KEY = "motion-mode";
const PERFORMANCE_MODE_STORAGE_KEY = "performance-mode";
type ThemeMode = "dark" | "light";

const sectionHueStops = [198, 28, 338, 160, 46, 274, 210];
const getProjectMediaPlaceholderSrc = (src: string) =>
  src.replace(/(\.[a-z0-9]+)([?#].*)?$/i, "-placeholder.jpg$2");
const eagerMediaSources = Array.from(
  new Set(
    [
      ...portfolio.featuredProjects,
      ...portfolio.otherProjects,
    ].flatMap<string>((project) =>
      project.media
        ? [project.media.src, project.media.dialogSrc ?? project.media.src]
        : [],
    ),
  ),
);
const eagerIconSources = Array.from(
  new Set(portfolio.skillsCloud.items.map((item) => item.icon)),
);
const eagerPlaceholderSources = Array.from(
  new Set(
    [...portfolio.featuredProjects, ...portfolio.otherProjects]
      .filter((project) => project.media)
      .map((project) => getProjectMediaPlaceholderSrc(project.media!.src)),
  ),
);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function interpolateHue(from: number, to: number, progress: number) {
  const delta = ((to - from + 540) % 360) - 180;

  return (from + delta * progress + 360) % 360;
}

// The target hue is the nearest section's own hue, not a value that follows
// the scroll position. The render loop then eases towards it for about a
// second. Every hue write repaints the page background, and Safari measured
// ~25 fps while scrolling when the hue changed on every frame; this way the
// colour only moves briefly around each section change, in every browser.
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
  const localProgress = Math.round(clamp(scaledProgress - startIndex, 0, 1));

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
  const [isConstrainedPerformance] = useState(isConstrainedPerformanceEnvironment);
  const [hasCoarseInput] = useState(hasCoarsePointer);
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(
    readInitialPerformanceMode,
  );
  const isLitePerformance = performanceMode === "lite";

  useEffect(() => {
    document.documentElement.dataset.performance = performanceMode;
  }, [performanceMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersSyncDecode = isSafariBrowser();
    const warmedImages = [
      ...eagerPlaceholderSources,
      ...eagerMediaSources,
      ...eagerIconSources,
    ].map((src) => {
      const image = new Image();
      image.decoding = prefersSyncDecode ? "sync" : "async";

      if ("fetchPriority" in image) {
        image.fetchPriority = "high";
      }

      image.src = src;

      if (typeof image.decode === "function") {
        void image.decode().catch(() => {
          // Ignore decode failures for SVGs and already-cached assets.
        });
      }

      return image;
    });

    return () => {
      warmedImages.length = 0;
    };
  }, []);

  useEffect(() => {
    if (isSafariBrowser()) {
      document.documentElement.dataset.browser = "safari";
    }
  }, []);

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

  // Pause decorative CSS loops inside sections that are off screen
  // (see `main section[data-offscreen]` in index.css).
  useEffect(() => {
    if (typeof window.IntersectionObserver !== "function") {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            delete section.dataset.offscreen;
          } else {
            section.dataset.offscreen = "";
          }
        });
      },
      { rootMargin: "200px 0px 200px 0px" },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        delete section.dataset.offscreen;
      });
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const useDirectScrollSync =
      hasCoarseInput ||
      isConstrainedPerformance ||
      isLitePerformance;
    // Colours ease towards each section's hue (see getGradientStateAtProgress
    // and the stepped hue writes in render).
    const useDirectColorSync = useDirectScrollSync;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const sectionElements = Array.from(
      document.querySelectorAll<HTMLElement>("main .section"),
    );
    const revealItems = revealElements.map((element) => ({
      element,
      top: 0,
      height: 0,
      isVisible: false,
    }));
    const sections = sectionElements.map((element) => ({
      element,
      top: 0,
      height: 0,
      center: 0,
      progress: -1,
    }));
    const rootStyle = document.documentElement.style;
    let isMounted = true;
    let animationFrame = 0;
    let measureFrame = 0;
    let isRevealInitialized = false;
    let prevRenderScrollY = window.scrollY;
    let viewportHeight = window.innerHeight;
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

      const gradientState = getGradientStateAtProgress(
        gradientProgress,
        sections.length,
      );
      targetDepth = gradientState.depth;
      targetHue = gradientState.hue;
    };

    const render = () => {
      const scrollY = window.scrollY;
      prevRenderScrollY = scrollY;
      const pageProgress =
        scrollableHeight <= 0 ? 0 : clamp(scrollY / scrollableHeight, 0, 1);
      let hasPendingAnimation = false;

      revealItems.forEach((item) => {
        if (item.isVisible) return;
        const topInViewport = item.top - scrollY;
        // Native scroll (Safari): scrollY updates instantly, so 0.98 is enough.
        // Lenis scroll (Chrome): scrollY is lerp-interpolated and lags behind
        // the user's actual scroll, so we trigger earlier to compensate.
        const revealEdge = isNativeScroll ? 0.98 : 1.25;
        const inViewport =
          topInViewport < viewportHeight * revealEdge &&
          topInViewport + item.height > viewportHeight * 0.04;
        const isScrolledPast =
          !isRevealInitialized && topInViewport + item.height <= viewportHeight * 0.04;

        if (inViewport || isScrolledPast) {
          item.element.classList.add("is-visible");
          item.isVisible = true;
        }
      });

      isRevealInitialized = true;
      targetProgress = pageProgress;

      const progressDelta = targetProgress - currentProgress;

      if (useDirectColorSync || Math.abs(progressDelta) < 0.0015) {
        currentProgress = targetProgress;
      } else {
        currentProgress += progressDelta * 0.18;
        hasPendingAnimation = true;
      }

      updateSectionTargets(scrollY, currentProgress);

      const depthDelta = targetDepth - currentDepth;
      const hueDelta = ((targetHue - currentHue + 540) % 360) - 180;

      if (useDirectColorSync || Math.abs(depthDelta) < 0.0015) {
        currentDepth = targetDepth;
      } else {
        currentDepth += depthDelta * 0.12;
        hasPendingAnimation = true;
      }

      if (useDirectColorSync || Math.abs(hueDelta) < 0.08) {
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

      // Each hue write repaints the page background. Writing in 8 degree steps
      // (plus the final value) keeps the colour easing visible while costing
      // Safari only a few fps; writing every frame cost it ~20 fps.
      const hueArrived = Math.abs(currentHue - targetHue) < 0.08;
      if (
        Number.isNaN(writtenHue) ||
        Math.abs(currentHue - writtenHue) >= 8 ||
        (hueArrived && currentHue !== writtenHue)
      ) {
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

    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - prevRenderScrollY);
      if (isNativeScroll && delta > viewportHeight * 0.4) {
        if (animationFrame !== 0) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }
        render();
      } else {
        queueRender();
      }
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
    const isNativeScroll = shouldUseNativeScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("lenis-scroll", queueRender);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("load", scheduleMeasure);
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
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("lenis-scroll", queueRender);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("load", scheduleMeasure);
      window.visualViewport?.removeEventListener("resize", scheduleMeasure);
    };
  }, [
    hasCoarseInput,
    isConstrainedPerformance,
    isLitePerformance,
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

  return (
    <div className={`site-shell motion-mode-${motionMode}`}>
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
          isLitePerformance={isLitePerformance}
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
