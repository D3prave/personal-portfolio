import { ReactLenis, useLenis } from "lenis/react";
import type { ReactNode } from "react";
import { isSafariBrowser, shouldUseNativeScroll } from "../utils/performance";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

function LenisEventBridge() {
  useLenis(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(new Event("lenis-scroll"));
  });

  return null;
}

export function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  if (shouldUseNativeScroll()) {
    return <>{children}</>;
  }

  // On Safari, use a slightly higher lerp so the inertia animation settles
  // in fewer rAF frames, reducing the number of CSS property writes per scroll.
  const lerp = isSafariBrowser() ? 0.12 : 0.16;

  return (
    <ReactLenis
      root
      options={{
        duration: 1.05,
        lerp,
        smoothWheel: true,
      }}
    >
      <LenisEventBridge />
      {children}
    </ReactLenis>
  );
}
