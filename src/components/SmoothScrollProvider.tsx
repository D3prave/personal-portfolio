import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { shouldUseNativeScroll } from "../utils/performance";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

const LINE_SCROLL_SIZE = 100 / 6;

function normalizeWheelDelta(event: WheelEvent) {
  let { deltaX, deltaY } = event;

  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    deltaX *= LINE_SCROLL_SIZE;
    deltaY *= LINE_SCROLL_SIZE;
  } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    deltaX *= window.innerWidth;
    deltaY *= window.innerHeight;
  }

  return { deltaX, deltaY };
}

function canScrollNestedContainer(
  node: HTMLElement,
  deltaX: number,
  deltaY: number,
  rootElement: HTMLElement,
) {
  if (node === rootElement || node === document.documentElement || node === document.body) {
    return false;
  }

  const style = window.getComputedStyle(node);
  const canScrollY =
    /(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
  const canScrollX =
    /(auto|scroll|overlay)/.test(style.overflowX) && node.scrollWidth > node.clientWidth;

  if (canScrollY) {
    const threshold = 1;
    const hasRoomUp = node.scrollTop > threshold;
    const hasRoomDown =
      node.scrollTop + node.clientHeight < node.scrollHeight - threshold;

    if ((deltaY < 0 && hasRoomUp) || (deltaY > 0 && hasRoomDown)) {
      return true;
    }
  }

  if (canScrollX) {
    const threshold = 1;
    const hasRoomLeft = node.scrollLeft > threshold;
    const hasRoomRight =
      node.scrollLeft + node.clientWidth < node.scrollWidth - threshold;

    if ((deltaX < 0 && hasRoomLeft) || (deltaX > 0 && hasRoomRight)) {
      return true;
    }
  }

  return false;
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

function LenisWheelBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || typeof window === "undefined") {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey) {
        return;
      }

      const { deltaX, deltaY } = normalizeWheelDelta(event);

      if (deltaX === 0 && deltaY === 0) {
        return;
      }

      for (const entry of event.composedPath()) {
        if (
          entry instanceof HTMLElement &&
          canScrollNestedContainer(entry, deltaX, deltaY, lenis.rootElement)
        ) {
          return;
        }
      }

      const delta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;

      if (event.cancelable) {
        event.preventDefault();
      }

      lenis.scrollTo(lenis.targetScroll + delta * 0.85, {
        programmatic: false,
        force: true,
        lerp: 0.1,
      });
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel, {
        capture: true,
      });
    };
  }, [lenis]);

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
        smoothWheel: false,
        virtualScroll: ({ event }) => !event.type.includes("wheel"),
        anchors: {
          offset: -88,
        },
      }}
    >
      <LenisEventBridge />
      <LenisWheelBridge />
      {children}
    </ReactLenis>
  );
}
