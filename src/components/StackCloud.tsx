import { useEffect, useMemo, useRef, useState } from "react";
import type { StackCloudItem } from "../types/portfolio";
import {
  hasCoarsePointer,
  isConstrainedPerformanceEnvironment,
  prefersReducedMotion,
} from "../utils/performance";

interface StackCloudProps {
  items: StackCloudItem[];
}

interface OrbitalItem extends StackCloudItem {
  id: number;
  x: number;
  y: number;
  z: number;
}

interface CloudPalette {
  coreGlow: string;
  plateFill: string;
  plateLine: string;
  shadow: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function traceRoundedTile(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();

  if (typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
    return;
  }

  const limitedRadius = Math.min(radius, width / 2, height / 2);

  context.moveTo(x + limitedRadius, y);
  context.lineTo(x + width - limitedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + limitedRadius);
  context.lineTo(x + width, y + height - limitedRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - limitedRadius, y + height);
  context.lineTo(x + limitedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - limitedRadius);
  context.lineTo(x, y + limitedRadius);
  context.quadraticCurveTo(x, y, x + limitedRadius, y);
  context.closePath();
}

function createSphereLayout(items: StackCloudItem[]) {
  const offset = 2 / items.length;
  const increment = Math.PI * (3 - Math.sqrt(5));

  return items.map<OrbitalItem>((item, index) => {
    const y = index * offset - 1 + offset / 2;
    const radius = Math.sqrt(1 - y * y);
    const phi = index * increment;

    return {
      ...item,
      id: index,
      x: Math.cos(phi) * radius,
      y,
      z: Math.sin(phi) * radius,
    };
  });
}

export function StackCloud({ items }: StackCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const rotationRef = useRef({ x: -0.34, y: 0.52 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(false);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    x: 0,
    y: 0,
  });
  const sizeRef = useRef({ width: 0, height: 0, radius: 110, dpr: 1 });
  const paletteRef = useRef<CloudPalette>({
    coreGlow: "rgba(59, 130, 246, 0.12)",
    plateFill: "rgba(255, 255, 255, 0.05)",
    plateLine: "rgba(255, 255, 255, 0.08)",
    shadow: "rgba(0, 0, 0, 0.38)",
  });
  const visibleRef = useRef(true);
  const pageVisibleRef = useRef(true);
  const [isConstrained] = useState(isConstrainedPerformanceEnvironment);
  const [isReducedMotion] = useState(prefersReducedMotion);
  const [hasCoarseInput] = useState(hasCoarsePointer);
  const orbitalItems = useMemo(() => createSphereLayout(items), [items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;

    if (!canvas || !stage) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let disposed = false;
    const loadedIcons = new Array(items.length).fill(false);
    const images = items.map((item) => {
      const image = new Image();
      image.decoding = "async";
      image.src = item.icon;
      return image;
    });

    const updatePalette = () => {
      const styles = window.getComputedStyle(stage);

      paletteRef.current = {
        coreGlow: styles.getPropertyValue("--cloud-core-glow").trim(),
        plateFill: styles.getPropertyValue("--cloud-plate-fill").trim(),
        plateLine: styles.getPropertyValue("--cloud-plate-line").trim(),
        shadow: styles.getPropertyValue("--cloud-shadow").trim(),
      };
    };

    const resizeCanvas = () => {
      const bounds = stage.getBoundingClientRect();
      const dpr = clamp(window.devicePixelRatio || 1, 1, isConstrained ? 1.15 : 1.7);
      const width = Math.max(bounds.width, 260);
      const height = Math.max(bounds.height, 280);

      sizeRef.current = {
        width,
        height,
        radius: Math.min(width, height) * (isConstrained ? 0.3 : 0.338),
        dpr,
      };

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawScene = () => {
      const { width, height, radius } = sizeRef.current;
      const palette = paletteRef.current;
      const centerX = width / 2;
      const centerY = height / 2;

      context.clearRect(0, 0, width, height);

      const coreGlow = context.createRadialGradient(
        centerX,
        centerY * 0.92,
        0,
        centerX,
        centerY * 0.92,
        radius * 1.15,
      );
      coreGlow.addColorStop(0, palette.coreGlow);
      coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = coreGlow;
      context.beginPath();
      context.arc(centerX, centerY * 0.92, radius * 1.1, 0, Math.PI * 2);
      context.fill();

      const projected = orbitalItems
        .map((item) => {
          const cosY = Math.cos(rotationRef.current.y);
          const sinY = Math.sin(rotationRef.current.y);
          const cosX = Math.cos(rotationRef.current.x);
          const sinX = Math.sin(rotationRef.current.x);

          const baseX = item.x * radius;
          const baseY = item.y * radius;
          const baseZ = item.z * radius;

          const rotatedX = baseX * cosY - baseZ * sinY;
          const rotatedZ = baseX * sinY + baseZ * cosY;
          const rotatedY = baseY * cosX - rotatedZ * sinX;
          const depthZ = baseY * sinX + rotatedZ * cosX;
          const depth = (depthZ + radius) / (radius * 2);

          return {
            ...item,
            screenX: centerX + rotatedX,
            screenY: centerY + rotatedY * 0.95,
            depthZ,
            scale: 0.54 + depth * 0.74,
            opacity: 0.2 + depth * 0.8,
          };
        })
        .sort((left, right) => left.depthZ - right.depthZ);

      projected.forEach((item) => {
        const size = clamp(16 + item.scale * 24, 16, 46);
        const plateSize = size * 1.34;
        const plateRadius = plateSize * 0.24;
        const image = images[item.id];
        const isLoaded = loadedIcons[item.id];

        context.save();
        context.translate(item.screenX, item.screenY);
        context.globalAlpha = item.opacity;

        traceRoundedTile(
          context,
          -plateSize / 2,
          -plateSize / 2,
          plateSize,
          plateSize,
          plateRadius,
        );
        context.fillStyle = palette.plateFill;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = palette.plateLine;
        context.stroke();

        if (isLoaded) {
          context.shadowColor = palette.shadow;
          context.shadowBlur = item.scale * 12;
          context.drawImage(image, -size / 2, -size / 2, size, size);
        } else {
          context.beginPath();
          context.arc(0, 0, size * 0.2, 0, Math.PI * 2);
          context.fillStyle = palette.plateLine;
          context.fill();
        }

        context.restore();
      });
    };

    const stopLoop = () => {
      if (frameRef.current !== 0) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };

    const tick = () => {
      if (!visibleRef.current || !pageVisibleRef.current) {
        frameRef.current = 0;
        return;
      }

      const motionScale = isReducedMotion ? 0.42 : 1;
      const pointerEase = (hoverRef.current ? 0.18 : 0.08) * (isReducedMotion ? 0.72 : 1);
      const pointerInfluenceX =
        (isConstrained
          ? hoverRef.current
            ? 0.00195
            : 0.00115
          : hoverRef.current
            ? 0.0032
            : 0.0016) * motionScale;
      const pointerInfluenceY =
        (isConstrained
          ? hoverRef.current
            ? 0.00255
            : 0.00155
          : hoverRef.current
            ? 0.0048
            : 0.00225) * motionScale;
      const idleRotationX = (isConstrained ? -0.00155 : -0.00215) * motionScale;
      const idleRotationY = (isConstrained ? 0.00285 : 0.0044) * motionScale;

      pointerRef.current.x +=
        (pointerTargetRef.current.x - pointerRef.current.x) * pointerEase;
      pointerRef.current.y +=
        (pointerTargetRef.current.y - pointerRef.current.y) * pointerEase;

      const targetX = idleRotationX + pointerRef.current.y * pointerInfluenceX;
      const targetY = idleRotationY + pointerRef.current.x * pointerInfluenceY;
      const velocityEase =
        (dragRef.current.active ? 0.12 : hoverRef.current ? 0.18 : 0.11) *
        (isReducedMotion ? 0.78 : 1);

      velocityRef.current.x += (targetX - velocityRef.current.x) * velocityEase;
      velocityRef.current.y += (targetY - velocityRef.current.y) * velocityEase;
      rotationRef.current.x += velocityRef.current.x;
      rotationRef.current.y += velocityRef.current.y;

      drawScene();
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (frameRef.current !== 0 || !visibleRef.current || !pageVisibleRef.current) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    images.forEach((image, index) => {
      image.onload = () => {
        if (disposed) {
          return;
        }

        loadedIcons[index] = true;
        drawScene();
        startLoop();
      };
      image.onerror = () => {
        loadedIcons[index] = false;
      };
    });

    const handleVisibilityChange = () => {
      pageVisibleRef.current = document.visibilityState !== "hidden";

      if (!pageVisibleRef.current) {
        stopLoop();
        return;
      }

      startLoop();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const nextX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const nextY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      hoverRef.current = true;
      pointerTargetRef.current = {
        x: clamp(nextX, -1, 1),
        y: clamp(nextY, -1, 1),
      };
      startLoop();

      if (dragRef.current.active && dragRef.current.pointerId === event.pointerId) {
        const deltaX = event.clientX - dragRef.current.x;
        const deltaY = event.clientY - dragRef.current.y;
        const rotationX = deltaY * 0.0059;
        const rotationY = deltaX * 0.0059;

        rotationRef.current.x += rotationX;
        rotationRef.current.y += rotationY;
        velocityRef.current.x = velocityRef.current.x * 0.42 + rotationX * 0.58;
        velocityRef.current.y = velocityRef.current.y * 0.42 + rotationY * 0.58;
        dragRef.current.x = event.clientX;
        dragRef.current.y = event.clientY;
        drawScene();
      }
    };

    const handlePointerEnter = () => {
      hoverRef.current = true;
      startLoop();
    };

    const handlePointerLeave = () => {
      if (dragRef.current.active) {
        return;
      }

      hoverRef.current = false;
      pointerTargetRef.current = { x: 0, y: 0 };
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (hasCoarseInput || event.pointerType === "touch") {
        return;
      }

      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      hoverRef.current = true;
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (dragRef.current.pointerId !== event.pointerId) {
        return;
      }

      dragRef.current.active = false;

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      drawScene();
    });

    const visibilityObserver =
      typeof window.IntersectionObserver === "function"
        ? new IntersectionObserver(
            ([entry]) => {
              visibleRef.current = entry?.isIntersecting ?? true;

              if (!visibleRef.current) {
                stopLoop();
                return;
              }

              startLoop();
            },
            {
              rootMargin: "120px 0px 120px 0px",
              threshold: 0.01,
            },
          )
        : null;

    const mutationObserver = new MutationObserver(() => {
      updatePalette();
      drawScene();
    });

    updatePalette();
    resizeCanvas();
    drawScene();
    pageVisibleRef.current = document.visibilityState !== "hidden";

    resizeObserver.observe(stage);
    visibilityObserver?.observe(stage);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-motion-mode"],
    });

    canvas.addEventListener("pointerenter", handlePointerEnter);
    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    startLoop();

    return () => {
      disposed = true;
      stopLoop();
      resizeObserver.disconnect();
      visibilityObserver?.disconnect();
      mutationObserver.disconnect();
      canvas.removeEventListener("pointerenter", handlePointerEnter);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasCoarseInput, isConstrained, isReducedMotion, items, orbitalItems]);

  return (
    <div className="stack-cloud-stage" ref={stageRef}>
      <canvas
        ref={canvasRef}
        className="stack-cloud-canvas"
        aria-label="Rotating cloud of current languages, frameworks, and libraries"
        role="img"
      />
    </div>
  );
}
