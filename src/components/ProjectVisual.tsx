import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../types/portfolio";
import { isIOSWebKitBrowser, isSafariBrowser } from "../utils/performance";

interface ProjectVisualProps {
  visual: Project["visual"];
  media?: Project["media"];
  primary?: boolean;
  projectName: string;
}

function getRenderedImageBounds(frameRect: DOMRect, image: HTMLImageElement) {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return null;
  }

  const scale = Math.min(frameRect.width / naturalWidth, frameRect.height / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const left = frameRect.left + (frameRect.width - width) * 0.5;
  const top = frameRect.top + (frameRect.height - height) * 0.5;

  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

function getProjectMediaPlaceholderSrc(src: string) {
  return src.replace(/(\.[a-z0-9]+)([?#].*)?$/i, "-placeholder.jpg$2");
}

export function ProjectVisual({
  visual,
  media,
  primary = false,
  projectName,
}: ProjectVisualProps) {
  const isSafari = isSafariBrowser();
  const [isExpanded, setIsExpanded] = useState(false);
  const dialogFrameRef = useRef<HTMLDivElement>(null);
  const dialogImageRef = useRef<HTMLImageElement>(null);
  const dialogMagnifierRef = useRef<HTMLDivElement>(null);
  const pointerFrameRef = useRef(0);
  const queuedPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);

  useEffect(() => {
    if (!isExpanded || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // iOS Safari ignores overflow:hidden on <body> — the page keeps scrolling
    // behind the modal. Use position:fixed with a saved scroll offset instead,
    // then restore that offset when the modal closes.
    const isIOS = isIOSWebKitBrowser();
    const savedScrollY = window.scrollY;

    if (isIOS) {
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "scroll";
    } else {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (isIOS) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflowY = "";
        window.scrollTo(0, savedScrollY);
      } else {
        document.body.style.overflow = "";
      }
    };
  }, [isExpanded]);

  useEffect(() => {
    return () => {
      if (pointerFrameRef.current !== 0) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }
    };
  }, []);

  if (media) {
    const visualClassName = `project-visual project-visual--image ${
      primary ? "project-visual--primary" : ""
    } ${media.expandable ? "project-visual--interactive" : ""}`;
    const placeholderSrc = getProjectMediaPlaceholderSrc(media.src);
    const visualStyle = {
      ["--project-placeholder-image" as string]: `url("${placeholderSrc}")`,
      ["--project-placeholder-fit" as string]: media.fit ?? "cover",
      ["--project-placeholder-position" as string]: media.position ?? "center",
    };
    const imageStyle = {
      objectFit: media.fit ?? "cover",
      objectPosition: media.position ?? "center",
    } as const;

    const image = (
      <img
        className="project-visual-image"
        src={media.src}
        alt={media.alt}
        loading="eager"
        fetchPriority="high"
        decoding={isSafari ? "sync" : "async"}
        draggable={false}
        style={imageStyle}
      />
    );

    const hideMagnifier = () => {
      if (pointerFrameRef.current !== 0) {
        window.cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = 0;
      }

      queuedPointerRef.current = null;
      dialogMagnifierRef.current?.classList.remove("is-active");
    };

    const syncMagnifier = () => {
      pointerFrameRef.current = 0;

      const queuedPointer = queuedPointerRef.current;
      const frame = dialogFrameRef.current;
      const image = dialogImageRef.current;
      const magnifier = dialogMagnifierRef.current;

      if (!queuedPointer || !frame || !image || !magnifier) {
        return;
      }

      const frameRect = frame.getBoundingClientRect();
      const renderedBounds = getRenderedImageBounds(frameRect, image);

      if (!renderedBounds || renderedBounds.width < 24 || renderedBounds.height < 24) {
        magnifier.classList.remove("is-active");
        return;
      }

      if (
        queuedPointer.clientX < renderedBounds.left ||
        queuedPointer.clientX > renderedBounds.right ||
        queuedPointer.clientY < renderedBounds.top ||
        queuedPointer.clientY > renderedBounds.bottom
      ) {
        magnifier.classList.remove("is-active");
        return;
      }

      const zoomFactor = 2.12;
      const lensSize = Math.max(124, Math.min(168, renderedBounds.width * 0.19));
      const halfLens = lensSize * 0.5;
      const localX = queuedPointer.clientX - renderedBounds.left;
      const localY = queuedPointer.clientY - renderedBounds.top;
      const imageOffsetX = renderedBounds.left - frameRect.left;
      const imageOffsetY = renderedBounds.top - frameRect.top;
      const lensX = Math.min(
        Math.max(queuedPointer.clientX - frameRect.left, imageOffsetX + halfLens),
        imageOffsetX + renderedBounds.width - halfLens,
      );
      const lensY = Math.min(
        Math.max(queuedPointer.clientY - frameRect.top, imageOffsetY + halfLens),
        imageOffsetY + renderedBounds.height - halfLens,
      );

      magnifier.style.setProperty("--poster-magnifier-size", `${lensSize}px`);
      magnifier.style.setProperty("--poster-magnifier-x", `${lensX}px`);
      magnifier.style.setProperty("--poster-magnifier-y", `${lensY}px`);
      magnifier.style.backgroundSize = `${renderedBounds.width * zoomFactor}px ${
        renderedBounds.height * zoomFactor
      }px`;
      magnifier.style.backgroundPosition = `${halfLens - localX * zoomFactor}px ${
        halfLens - localY * zoomFactor
      }px`;
      magnifier.classList.add("is-active");
    };

    const queueMagnifierUpdate = (clientX: number, clientY: number) => {
      queuedPointerRef.current = { clientX, clientY };

      if (pointerFrameRef.current !== 0) {
        return;
      }

      pointerFrameRef.current = window.requestAnimationFrame(syncMagnifier);
    };

    if (media.expandable) {
      return (
        <>
          <button
            type="button"
            className={visualClassName}
            style={visualStyle}
            aria-haspopup="dialog"
            aria-label={media.expandLabel ?? `Open ${projectName} image`}
            onClick={() => setIsExpanded(true)}
          >
            {image}
            <span className="project-visual-expand">
              {media.expandLabel ?? "Expand image"}
            </span>
          </button>

          {isExpanded && typeof document !== "undefined"
            ? createPortal(
                <div
                  className="project-media-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`${projectName} expanded media`}
                >
                  <button
                    type="button"
                    className="project-media-dialog__backdrop"
                    aria-label="Close expanded media"
                    onClick={() => setIsExpanded(false)}
                  />

                  <div className="project-media-dialog__surface">
                    <button
                      type="button"
                      className="project-media-dialog__close"
                      onClick={() => setIsExpanded(false)}
                    >
                      Close
                    </button>

                    <p className="project-media-dialog__hint">
                      Hover over the poster to inspect details.
                    </p>

                    <div
                      ref={dialogFrameRef}
                      className="project-media-dialog__frame"
                      onPointerMove={(event) => {
                        if (event.pointerType === "touch") {
                          return;
                        }

                        queueMagnifierUpdate(event.clientX, event.clientY);
                      }}
                      onPointerLeave={hideMagnifier}
                      onPointerCancel={hideMagnifier}
                    >
                      <img
                        ref={dialogImageRef}
                        className="project-media-dialog__image"
                        src={media.dialogSrc ?? media.src}
                        alt={media.dialogAlt ?? media.alt}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        draggable={false}
                        style={{
                          objectFit: media.dialogFit ?? "contain",
                          objectPosition: media.dialogPosition ?? "center",
                        }}
                      />
                      <div
                        ref={dialogMagnifierRef}
                        className="project-media-dialog__magnifier"
                        aria-hidden="true"
                        style={{
                          backgroundImage: `url(${media.dialogSrc ?? media.src})`,
                        }}
                      />
                    </div>
                  </div>
                </div>,
                document.body,
              )
            : null}
        </>
      );
    }

    return (
      <div className={visualClassName} style={visualStyle}>
        {image}
      </div>
    );
  }

  return (
    <div
      className={`project-visual project-visual--${visual} ${primary ? "project-visual--primary" : ""}`}
      aria-hidden="true"
    >
      {visual === "graph" && (
        <svg viewBox="0 0 100 56" className="project-visual-svg">
          <path d="M10 42L32 18L52 28L72 12L90 24" />
          <path d="M16 16L34 30L58 18L78 40L92 30" />
          <circle cx="10" cy="42" r="2.5" />
          <circle cx="32" cy="18" r="2.5" />
          <circle cx="52" cy="28" r="2.5" />
          <circle cx="72" cy="12" r="2.5" />
          <circle cx="90" cy="24" r="2.5" />
          <circle cx="16" cy="16" r="2" />
          <circle cx="34" cy="30" r="2" />
          <circle cx="58" cy="18" r="2" />
          <circle cx="78" cy="40" r="2" />
          <circle cx="92" cy="30" r="2" />
        </svg>
      )}

      {visual === "booking" && (
        <div className="project-visual-booking">
          <div className="project-visual-calendar">
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                className={index === 2 || index === 5 || index === 9 ? "is-active" : undefined}
              />
            ))}
          </div>
          <div className="project-visual-occupancy">
            <span style={{ width: "74%" }} />
            <span style={{ width: "51%" }} />
            <span style={{ width: "88%" }} />
          </div>
        </div>
      )}

      {visual === "route" && (
        <svg viewBox="0 0 100 56" className="project-visual-svg project-visual-svg--route">
          <path d="M8 38C18 14 38 14 44 28S62 50 88 14" />
          <circle cx="8" cy="38" r="2.6" />
          <circle cx="28" cy="18" r="2.1" />
          <circle cx="44" cy="28" r="2.4" />
          <circle cx="64" cy="42" r="2.1" />
          <circle cx="88" cy="14" r="2.8" />
        </svg>
      )}

      {visual === "analytics" && (
        <div className="project-visual-analytics">
          <div className="project-visual-bars">
            <span style={{ height: "34%" }} />
            <span style={{ height: "62%" }} />
            <span style={{ height: "48%" }} />
            <span style={{ height: "82%" }} />
            <span style={{ height: "58%" }} />
          </div>
          <svg viewBox="0 0 100 32" className="project-visual-svg project-visual-svg--analytics">
            <path d="M4 24L22 18L36 20L56 10L74 14L96 6" />
          </svg>
        </div>
      )}

      {visual === "media" && (
        <div className="project-visual-media">
          <div className="project-visual-posters">
            <span />
            <span />
            <span />
          </div>
          <div className="project-visual-stars">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}
