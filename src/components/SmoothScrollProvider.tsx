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

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 0.92,
      }}
    >
      <LenisEventBridge />
      {children}
    </ReactLenis>
  );
}
