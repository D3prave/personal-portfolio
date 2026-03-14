import { createElement, startTransition, useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import type { SectionContent } from "../types/portfolio";
import { SectionIntro } from "./SectionIntro";

interface DeferredSectionProps<TProps extends object> {
  section: SectionContent;
  load: () => Promise<{ default: ComponentType<TProps> }>;
  componentProps: TProps;
  onReady?: () => void;
  rootMargin?: string;
}

export function DeferredSection<TProps extends object>({
  section,
  load,
  componentProps,
  onReady,
  rootMargin = "340px 0px",
}: DeferredSectionProps<TProps>) {
  const hostRef = useRef<HTMLElement>(null);
  const [LoadedComponent, setLoadedComponent] = useState<ComponentType<TProps> | null>(null);

  useEffect(() => {
    if (LoadedComponent) {
      return;
    }

    const host = hostRef.current;

    if (!host || typeof window === "undefined") {
      return;
    }

    let isDisposed = false;

    const loadComponent = () => {
      void load().then((module) => {
        if (isDisposed) {
          return;
        }

        startTransition(() => {
          setLoadedComponent(() => module.default);
        });
      });
    };

    if (typeof window.IntersectionObserver !== "function") {
      loadComponent();
      return () => {
        isDisposed = true;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        loadComponent();
        observer.disconnect();
      },
      {
        rootMargin,
        threshold: 0.01,
      },
    );

    observer.observe(host);

    return () => {
      isDisposed = true;
      observer.disconnect();
    };
  }, [LoadedComponent, load, rootMargin]);

  useEffect(() => {
    if (!LoadedComponent) {
      return;
    }

    onReady?.();
  }, [LoadedComponent, onReady]);

  if (LoadedComponent) {
    return createElement(LoadedComponent, componentProps);
  }

  return (
    <section ref={hostRef} className="section deferred-section" id={section.id}>
      <div className="container">
        <SectionIntro
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className="panel deferred-section__panel" aria-hidden="true">
          <span className="deferred-section__bar deferred-section__bar--strong" />
          <span className="deferred-section__bar" />
          <span className="deferred-section__bar deferred-section__bar--soft" />
        </div>
      </div>
    </section>
  );
}
