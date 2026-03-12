import { useEffect, useState } from "react";
import { AboutSection } from "./components/AboutSection";
import { AmbientField } from "./components/AmbientField";
import { CellField } from "./components/CellField";
import { ContactSection } from "./components/ContactSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { ScrollProgress } from "./components/ScrollProgress";
import { SkillsSection } from "./components/SkillsSection";
import { portfolio } from "./data/portfolio";

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const revealElements = document.querySelectorAll<HTMLElement>(".reveal");

    if (prefersReducedMotion) {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });
    }

    const observer = prefersReducedMotion
      ? null
      : new IntersectionObserver(
          (entries, currentObserver) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                return;
              }

              entry.target.classList.add("is-visible");
              currentObserver.unobserve(entry.target);
            });
          },
          {
            threshold: 0.2,
            rootMargin: "0px 0px -8% 0px",
          },
        );

    if (observer) {
      revealElements.forEach((element) => {
        observer.observe(element);
      });
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

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

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    const applyPointer = (x: number, y: number) => {
      document.documentElement.style.setProperty("--page-x", `${x}px`);
      document.documentElement.style.setProperty("--page-y", `${y}px`);
    };

    let currentX = window.innerWidth * 0.72;
    let currentY = window.innerHeight * 0.24;
    let targetX = currentX;
    let targetY = currentY;

    applyPointer(currentX, currentY);

    if (prefersReducedMotion || !supportsHover) {
      return;
    }

    let frame = 0;

    const render = () => {
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;

      currentX += deltaX * 0.08;
      currentY += deltaY * 0.08;
      applyPointer(currentX, currentY);

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        currentX = targetX;
        currentY = targetY;
        applyPointer(currentX, currentY);
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
      applyPointer(currentX, currentY);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="site-shell">
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

      <main>
        <HeroSection hero={portfolio.hero} contactLinks={portfolio.contactSection.contacts} />
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
