import { useEffect, useState } from "react";
import { AboutSection } from "./components/AboutSection";
import { AmbientField } from "./components/AmbientField";
import { CellField } from "./components/CellField";
import { ContactSection } from "./components/ContactSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { MotionModeSwitcher, type MotionMode } from "./components/MotionModeSwitcher";
import { ProjectsSection } from "./components/ProjectsSection";
import { ScrollProgress } from "./components/ScrollProgress";
import { SkillsSection } from "./components/SkillsSection";
import { portfolio } from "./data/portfolio";

const MOTION_MODE_STORAGE_KEY = "motion-mode";

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

const rippleDurationByMode = {
  core: 900,
  cinematic: 1180,
  experimental: 680,
} as const;

const sectionHueStops = [198, 28, 338, 160, 46, 274, 210];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (revealElements.length === 0) {
      return;
    }

    if (prefersReducedMotion) {
      revealElements.forEach((element) => {
        element.style.setProperty("--reveal-progress", "1");
        element.classList.add("is-visible");
      });
      return;
    }

    const revealItems = revealElements.map((element) => {
      const rawDelay = window
        .getComputedStyle(element)
        .getPropertyValue("--reveal-delay")
        .trim();
      const delayMs = rawDelay.endsWith("ms") ? Number.parseFloat(rawDelay) : 0;
      const delayOffset = clamp(delayMs / 420, 0, 0.28);

      return {
        element,
        delayOffset,
      };
    });

    let animationFrame = 0;

    const render = () => {
      const viewportHeight = window.innerHeight;
      const startLine = viewportHeight * 0.92;
      const travelDistance = viewportHeight * 0.46;

      revealItems.forEach(({ element, delayOffset }) => {
        const bounds = element.getBoundingClientRect();
        const baseProgress = clamp(
          (startLine - bounds.top) / (travelDistance + bounds.height * 0.22),
          0,
          1,
        );
        const adjustedProgress = clamp(
          (baseProgress - delayOffset) / (1 - delayOffset || 1),
          0,
          1,
        );

        element.style.setProperty("--reveal-progress", adjustedProgress.toFixed(3));

        if (adjustedProgress > 0.02) {
          element.classList.add("is-visible");
        }
      });

      animationFrame = 0;
    };

    const queueRender = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    queueRender();
    window.addEventListener("scroll", queueRender, { passive: true });
    window.addEventListener("resize", queueRender);
    window.addEventListener("lenis-scroll", queueRender);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", queueRender);
      window.removeEventListener("resize", queueRender);
      window.removeEventListener("lenis-scroll", queueRender);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.motionMode = motionMode;
    document.body.dataset.motionMode = motionMode;
    window.localStorage.setItem(MOTION_MODE_STORAGE_KEY, motionMode);
  }, [motionMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main .section"),
    );

    if (sections.length === 0) {
      return;
    }

    let animationFrame = 0;

    const render = () => {
      const viewportHeight = window.innerHeight;
      const viewportMid = viewportHeight * 0.54;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const bounds = section.getBoundingClientRect();
        const progress = clamp(
          (viewportHeight * 0.94 - bounds.top) /
            (bounds.height + viewportHeight * 0.72),
          0,
          1,
        );

        section.style.setProperty("--section-progress", progress.toFixed(3));

        const centerOffset = Math.abs(bounds.top + bounds.height * 0.5 - viewportMid);

        if (centerOffset < closestDistance) {
          closestDistance = centerOffset;
          closestIndex = index;
        }
      });

      const depth =
        sections.length > 1 ? closestIndex / (sections.length - 1) : 0;

      document.documentElement.style.setProperty("--section-depth", depth.toFixed(3));
      document.documentElement.style.setProperty(
        "--section-hue",
        sectionHueStops[closestIndex % sectionHueStops.length].toString(),
      );

      animationFrame = 0;
    };

    const queueRender = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    queueRender();
    window.addEventListener("scroll", queueRender, { passive: true });
    window.addEventListener("resize", queueRender);
    window.addEventListener("lenis-scroll", queueRender);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", queueRender);
      window.removeEventListener("resize", queueRender);
      window.removeEventListener("lenis-scroll", queueRender);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    if (prefersReducedMotion || !supportsHover) {
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

      target.style.removeProperty("--spotlight-x");
      target.style.removeProperty("--spotlight-y");
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
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentModeConfig = pointerConfig[motionMode];
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
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

    if (prefersReducedMotion || !supportsHover) {
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
  }, [motionMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const modeConfig = cellConfig[motionMode];
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const cellNodes = Array.from(
      document.querySelectorAll<HTMLElement>(".cell-node-shell"),
    );

    if (prefersReducedMotion || !supportsHover || cellNodes.length === 0) {
      return;
    }

    let pointerX = window.innerWidth * 0.62;
    let pointerY = window.innerHeight * 0.38;
    let frame = 0;

    const render = () => {
      cellNodes.forEach((node) => {
        const bounds = node.getBoundingClientRect();
        const centerX = bounds.left + bounds.width * 0.5;
        const centerY = bounds.top + bounds.height * 0.5;
        const deltaX = pointerX - centerX;
        const deltaY = pointerY - centerY;
        const distance = Math.hypot(deltaX, deltaY);
        const proximity = clamp(1 - distance / modeConfig.radius, 0, 1);
        const strength = proximity * proximity;
        const normalizedX = distance > 0 ? deltaX / distance : 0;
        const normalizedY = distance > 0 ? deltaY / distance : 0;
        const shift = strength * modeConfig.push;
        const tilt = strength * modeConfig.tilt;

        node.style.setProperty("--cell-react", strength.toFixed(3));
        node.style.setProperty(
          "--cell-shift-x",
          `${(normalizedX * shift).toFixed(2)}px`,
        );
        node.style.setProperty(
          "--cell-shift-y",
          `${(normalizedY * shift).toFixed(2)}px`,
        );
        node.style.setProperty("--cell-tilt", `${(normalizedX * tilt).toFixed(3)}deg`);
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

    queueRender();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", queueRender, { passive: true });
    window.addEventListener("resize", queueRender);
    window.addEventListener("lenis-scroll", queueRender);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", queueRender);
      window.removeEventListener("resize", queueRender);
      window.removeEventListener("lenis-scroll", queueRender);

      cellNodes.forEach((node) => {
        node.style.removeProperty("--cell-react");
        node.style.removeProperty("--cell-shift-x");
        node.style.removeProperty("--cell-shift-y");
        node.style.removeProperty("--cell-tilt");
      });
    };
  }, [motionMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const cellField = document.querySelector<HTMLElement>(".cell-field");

    if (prefersReducedMotion || !supportsHover || !cellField) {
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

      if (motionMode === "experimental") {
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
  }, [motionMode]);

  return (
    <div className={`site-shell motion-mode-${motionMode}`}>
      <CellField />
      <AmbientField />
      <ScrollProgress />
      <Header
        brand={portfolio.brand}
        roleLabel={portfolio.roleLabel}
        navigation={portfolio.navigation}
        theme={theme}
        onToggleTheme={() =>
          setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark",
          )
        }
      />
      <MotionModeSwitcher mode={motionMode} onChange={setMotionMode} />

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
          skillGroups={portfolio.skillGroups}
        />
        <ExperienceSection
          section={portfolio.experienceSection}
          experience={portfolio.experience}
        />
        <ContactSection contact={portfolio.contactSection} />
      </main>

      <div className="cursor-comet" aria-hidden="true" />
      <div className="cursor-trail" aria-hidden="true" />

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
