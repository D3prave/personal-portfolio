import { useEffect, useRef } from "react";

function readProgress() {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  if (scrollableHeight <= 0) {
    return 0;
  }

  return Math.min(window.scrollY / scrollableHeight, 1);
}

export function ScrollProgress() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let animationFrame = 0;
    let currentProgress = readProgress();
    let targetProgress = currentProgress;

    const applyProgress = (value: number) => {
      barRef.current?.style.setProperty("--scroll-progress", value.toString());
      document.documentElement.style.setProperty("--page-scroll", value.toString());
    };

    const render = () => {
      currentProgress += (targetProgress - currentProgress) * 0.18;

      if (Math.abs(targetProgress - currentProgress) < 0.0005) {
        currentProgress = targetProgress;
        applyProgress(currentProgress);
        animationFrame = 0;
        return;
      }

      applyProgress(currentProgress);
      animationFrame = window.requestAnimationFrame(render);
    };

    const queueRender = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const updateTarget = () => {
      targetProgress = readProgress();
      queueRender();
    };

    applyProgress(currentProgress);
    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    window.addEventListener("lenis-scroll", updateTarget);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("lenis-scroll", updateTarget);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} className="scroll-progress-bar" />
    </div>
  );
}
