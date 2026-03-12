import { ReactLenis, useLenis } from "lenis/react";
import type { ReactNode } from "react";

function LenisEventBridge() {
  useLenis(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(new Event("lenis-scroll"));
  });

  return null;
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.05,
        lerp: 0.16,
        smoothWheel: true,
        anchors: {
          offset: -88,
        },
      }}
    >
      <LenisEventBridge />
      {children}
    </ReactLenis>
  );
}
