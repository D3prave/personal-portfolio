import { ReactLenis, useLenis } from "lenis/react";
import type { ReactNode } from "react";
import { shouldUseNativeScroll } from "../utils/performance";

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

  // Same feel in every desktop browser.
  const lerp = 0.16;

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
