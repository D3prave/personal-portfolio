import { useEffect, useMemo, useRef, useState } from "react";
import type { StackCloudItem } from "../types/portfolio";
import type { PerformanceMode } from "../types/ui";
import {
  hasCoarsePointer,
  isConstrainedPerformanceEnvironment,
} from "../utils/performance";

interface StackCloudProps {
  items: StackCloudItem[];
  performanceMode: PerformanceMode;
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
  highlightFill: string;
  highlightLine: string;
  tooltipFill: string;
  tooltipText: string;
}

interface ProjectedOrbitalItem extends OrbitalItem {
  screenX: number;
  screenY: number;
  depthZ: number;
  scale: number;
  opacity: number;
  size: number;
  plateSize: number;
  plateRadius: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Orientation is kept as a 3x3 rotation matrix (row-major), not as Euler angles.
// Screen space: x right, y down, z toward the viewer. Every drag / spin / wobble is
// applied as a rotation around a SCREEN axis (premultiplied), so the ball reacts the
// same way no matter how it is currently oriented: no poles, no gimbal flip.
type Mat3 = [number, number, number, number, number, number, number, number, number];

const SPRITE_ICON = 56;
const SPRITE_PAD = 18;
const SPRITE_TOTAL = SPRITE_ICON + SPRITE_PAD * 2;

function identity(): Mat3 {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

function multiply(a: Mat3, b: Mat3): Mat3 {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

// Rotation matrix for rotation vector (wx, wy, wz): axis = w / |w|, angle = |w|.
function rotationFromVector(wx: number, wy: number, wz: number): Mat3 {
  const angle = Math.hypot(wx, wy, wz);

  if (angle < 1e-9) {
    return identity();
  }

  const ux = wx / angle;
  const uy = wy / angle;
  const uz = wz / angle;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;

  return [
    t * ux * ux + c, t * ux * uy - s * uz, t * ux * uz + s * uy,
    t * ux * uy + s * uz, t * uy * uy + c, t * uy * uz - s * ux,
    t * ux * uz - s * uy, t * uy * uz + s * ux, t * uz * uz + c,
  ];
}

// Gram-Schmidt on the rows, keeps the matrix a pure rotation after many small steps.
function orthonormalize(m: Mat3): Mat3 {
  let ax = m[0], ay = m[1], az = m[2];
  let len = Math.hypot(ax, ay, az) || 1;
  ax /= len; ay /= len; az /= len;

  let bx = m[3], by = m[4], bz = m[5];
  const dot = ax * bx + ay * by + az * bz;
  bx -= dot * ax; by -= dot * ay; bz -= dot * az;
  len = Math.hypot(bx, by, bz) || 1;
  bx /= len; by /= len; bz /= len;

  return [
    ax, ay, az,
    bx, by, bz,
    ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx,
  ];
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

export function StackCloud({
  items,
  performanceMode,
}: StackCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const staticFrameRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  // Same starting pose as the old Euler setup (x = -0.34, y = 0.52).
  const orientationRef = useRef<Mat3>(
    multiply(rotationFromVector(-0.34, 0, 0), rotationFromVector(0, -0.52, 0)),
  );
  const displayMatrixRef = useRef<Mat3>(identity());
  const stepCountRef = useRef(0);
  const autoOrbitRef = useRef({ wobbleX: 0, wobbleY: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const dragDeltaRef = useRef({ x: 0, y: 0 });
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerCanvasRef = useRef({ x: 0, y: 0, active: false });
  const hoverRef = useRef(false);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    x: 0,
    y: 0,
  });
  const hoveredItemIdRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, radius: 110, dpr: 1 });
  const paletteRef = useRef<CloudPalette>({
    coreGlow: "rgba(59, 130, 246, 0.12)",
    plateFill: "rgba(255, 255, 255, 0.05)",
    plateLine: "rgba(255, 255, 255, 0.08)",
    shadow: "rgba(0, 0, 0, 0.38)",
    highlightFill: "rgba(125, 211, 252, 0.12)",
    highlightLine: "rgba(125, 211, 252, 0.34)",
    tooltipFill: "rgba(6, 10, 18, 0.86)",
    tooltipText: "rgba(240, 249, 255, 0.96)",
  });
  const visibleRef = useRef(true);
  const pageVisibleRef = useRef(true);
  const [isConstrained] = useState(isConstrainedPerformanceEnvironment);
  const [hasCoarseInput] = useState(hasCoarsePointer);
  const isLitePerformance = performanceMode === "lite";
  const isFullPerformance = performanceMode === "full";
  const shouldAnimate = isFullPerformance;
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

    // Each SVG icon is rasterised once (with its drop shadow baked in) into an
    // offscreen canvas. Per frame we only blit bitmaps. Before, every frame re-scaled
    // 31 SVGs and ran a Gaussian shadow blur on each, which is what made Chrome lag
    // (Safari skipped the shadow, so it looked flatter but ran smoother).
    const sprites: (HTMLCanvasElement | null)[] = new Array(items.length).fill(null);
    let spriteDpr = 0;
    let spriteShadow = "";

    const bakeSprite = (index: number) => {
      if (!loadedIcons[index]) {
        return;
      }

      const dpr = sizeRef.current.dpr;
      const sprite = sprites[index] ?? document.createElement("canvas");
      const pixelSize = Math.ceil(SPRITE_TOTAL * dpr);
      sprite.width = pixelSize;
      sprite.height = pixelSize;
      const spriteContext = sprite.getContext("2d");

      if (!spriteContext) {
        return;
      }

      spriteContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      spriteContext.clearRect(0, 0, SPRITE_TOTAL, SPRITE_TOTAL);
      spriteContext.shadowColor = paletteRef.current.shadow;
      spriteContext.shadowBlur = 12 * dpr;
      spriteContext.drawImage(images[index], SPRITE_PAD, SPRITE_PAD, SPRITE_ICON, SPRITE_ICON);
      sprites[index] = sprite;
    };

    const bakeAllSprites = () => {
      spriteDpr = sizeRef.current.dpr;
      spriteShadow = paletteRef.current.shadow;
      items.forEach((_, index) => bakeSprite(index));
    };

    const bakeIfStale = () => {
      if (spriteDpr !== sizeRef.current.dpr || spriteShadow !== paletteRef.current.shadow) {
        bakeAllSprites();
      }
    };

    let coreGlowCache: CanvasGradient | null = null;

    const projected: ProjectedOrbitalItem[] = orbitalItems.map((item) => ({
      ...item,
      screenX: 0,
      screenY: 0,
      depthZ: 0,
      scale: 1,
      opacity: 1,
      size: 0,
      plateSize: 0,
      plateRadius: 0,
    }));

    const rotateOrientation = (wx: number, wy: number) => {
      if (Math.abs(wx) < 1e-7 && Math.abs(wy) < 1e-7) {
        return;
      }

      orientationRef.current = multiply(rotationFromVector(wx, wy, 0), orientationRef.current);
      stepCountRef.current += 1;

      if (stepCountRef.current % 120 === 0) {
        orientationRef.current = orthonormalize(orientationRef.current);
      }
    };

    const updatePalette = () => {
      const styles = window.getComputedStyle(stage);
      const previousPalette = paletteRef.current;

      paletteRef.current = {
        coreGlow:
          styles.getPropertyValue("--cloud-core-glow").trim() || previousPalette.coreGlow,
        plateFill:
          styles.getPropertyValue("--cloud-plate-fill").trim() || previousPalette.plateFill,
        plateLine:
          styles.getPropertyValue("--cloud-plate-line").trim() || previousPalette.plateLine,
        shadow: styles.getPropertyValue("--cloud-shadow").trim() || previousPalette.shadow,
        highlightFill:
          styles.getPropertyValue("--cloud-highlight-fill").trim() ||
          previousPalette.highlightFill,
        highlightLine:
          styles.getPropertyValue("--cloud-highlight-line").trim() ||
          previousPalette.highlightLine,
        tooltipFill:
          styles.getPropertyValue("--cloud-tooltip-fill").trim() ||
          previousPalette.tooltipFill,
        tooltipText:
          styles.getPropertyValue("--cloud-tooltip-text").trim() ||
          previousPalette.tooltipText,
      };
    };

    const pickHoveredItem = (projected: ProjectedOrbitalItem[]) => {
      if (!pointerCanvasRef.current.active) {
        hoveredItemIdRef.current = null;
        return null;
      }

      const { x, y } = pointerCanvasRef.current;

      for (let index = projected.length - 1; index >= 0; index -= 1) {
        const item = projected[index];
        const halfSize = item.plateSize * 0.52;

        if (
          x >= item.screenX - halfSize &&
          x <= item.screenX + halfSize &&
          y >= item.screenY - halfSize &&
          y <= item.screenY + halfSize
        ) {
          hoveredItemIdRef.current = item.id;
          return item;
        }
      }

      hoveredItemIdRef.current = null;
      return null;
    };

    const drawItem = (item: ProjectedOrbitalItem, isHovered: boolean) => {
      const palette = paletteRef.current;
      const sprite = sprites[item.id];
      const scaleMultiplier = isHovered ? 1.14 : 1;
      const size = item.size * scaleMultiplier;
      const plateSize = item.plateSize * scaleMultiplier;
      const plateRadius = item.plateRadius * scaleMultiplier;

      context.save();
      context.translate(item.screenX, item.screenY);
      context.globalAlpha = isHovered ? 1 : item.opacity;

      traceRoundedTile(
        context,
        -plateSize / 2,
        -plateSize / 2,
        plateSize,
        plateSize,
        plateRadius,
      );
      context.fillStyle = isHovered ? palette.highlightFill : palette.plateFill;
      context.fill();
      context.lineWidth = isHovered ? 1.35 : 1;
      context.strokeStyle = isHovered ? palette.highlightLine : palette.plateLine;
      context.stroke();

      if (sprite) {
        const total = size * (SPRITE_TOTAL / SPRITE_ICON);
        context.drawImage(sprite, -total / 2, -total / 2, total, total);
      } else {
        context.beginPath();
        context.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        context.fillStyle = isHovered ? palette.highlightLine : palette.plateLine;
        context.fill();
      }

      context.restore();
    };

    const drawTooltip = (item: ProjectedOrbitalItem) => {
      const palette = paletteRef.current;
      const label = item.label;
      const fontSize = clamp(11.5 + item.scale * 1.9, 11.5, 14.2);
      const labelPaddingX = 10;
      const labelHeight = 28;
      const maxWidth = sizeRef.current.width - 16;

      context.save();
      context.font = `600 ${fontSize}px "IBM Plex Sans", system-ui, sans-serif`;
      const textWidth = context.measureText(label).width;
      const bubbleWidth = clamp(textWidth + labelPaddingX * 2, 72, maxWidth);
      const bubbleX = clamp(
        item.screenX - bubbleWidth / 2,
        8,
        sizeRef.current.width - bubbleWidth - 8,
      );
      const bubbleY = clamp(
        item.screenY + item.plateSize * 0.72,
        8,
        sizeRef.current.height - labelHeight - 8,
      );

      traceRoundedTile(context, bubbleX, bubbleY, bubbleWidth, labelHeight, 11);
      context.fillStyle = palette.tooltipFill;
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = palette.highlightLine;
      context.stroke();

      context.fillStyle = palette.tooltipText;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(label, bubbleX + bubbleWidth / 2, bubbleY + labelHeight / 2 + 0.5);
      context.restore();
    };

    const resizeCanvas = () => {
      const width = Math.max(canvas.offsetWidth, 260);
      const height = Math.max(canvas.offsetHeight, 280);
      const dprMax = isConstrained || isLitePerformance || hasCoarseInput ? 1.15 : 1.55;
      const dpr = clamp(window.devicePixelRatio || 1, 1, dprMax);

      sizeRef.current = {
        width,
        height,
        radius: Math.min(width, height) * (isConstrained ? 0.34 : 0.40),
        dpr,
      };

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      coreGlowCache = null;
      bakeIfStale();
    };

    const drawScene = () => {
      const { width, height, radius } = sizeRef.current;
      const palette = paletteRef.current;
      const centerX = width / 2;
      const centerY = height / 2;

      context.clearRect(0, 0, width, height);

      if (!coreGlowCache) {
        coreGlowCache = context.createRadialGradient(
          centerX,
          centerY * 0.92,
          0,
          centerX,
          centerY * 0.92,
          radius * 1.15,
        );
        coreGlowCache.addColorStop(0, palette.coreGlow);
        coreGlowCache.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      context.fillStyle = coreGlowCache;
      context.beginPath();
      context.arc(centerX, centerY * 0.92, radius * 1.1, 0, Math.PI * 2);
      context.fill();

      const m = displayMatrixRef.current;

      // Reuse the same objects every frame instead of allocating 31 new ones.
      for (let index = 0; index < projected.length; index += 1) {
        const item = projected[index];
        const px = item.x;
        const py = item.y;
        const pz = item.z;
        const rotatedX = (m[0] * px + m[1] * py + m[2] * pz) * radius;
        const rotatedY = (m[3] * px + m[4] * py + m[5] * pz) * radius;
        const depthZ = (m[6] * px + m[7] * py + m[8] * pz) * radius;
        const depth = (depthZ + radius) / (radius * 2);
        const scale = 0.54 + depth * 0.74;
        const size = clamp(16 + scale * 24, 16, 46);

        item.screenX = centerX + rotatedX;
        item.screenY = centerY + rotatedY * 0.95;
        item.depthZ = depthZ;
        item.scale = scale;
        item.opacity = 0.2 + depth * 0.8;
        item.size = size;
        item.plateSize = size * 1.34;
        item.plateRadius = size * 1.34 * 0.24;
      }

      projected.sort((left, right) => left.depthZ - right.depthZ);
      const hoveredItem = dragRef.current.active ? null : pickHoveredItem(projected);

      projected.forEach((item) => {
        if (hoveredItem && item.id === hoveredItem.id) {
          return;
        }

        drawItem(item, false);
      });

      if (hoveredItem) {
        drawItem(hoveredItem, true);
        drawTooltip(hoveredItem);
      }
    };

    const stopLoop = () => {
      if (frameRef.current !== 0) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      if (staticFrameRef.current !== 0) {
        window.cancelAnimationFrame(staticFrameRef.current);
        staticFrameRef.current = 0;
      }

      lastTickRef.current = null;
    };

    const getMotionScale = () => (isLitePerformance ? 0.7 : hasCoarseInput ? 0.84 : 1);

    const getOrbitProfile = () =>
      isFullPerformance
        ? {
            speedY: hasCoarseInput ? 0.13 : 0.18,
            wobbleXAmplitude: hasCoarseInput ? 0.055 : 0.075,
            wobbleYAmplitude: hasCoarseInput ? 0.028 : 0.04,
            wobbleXSpeed: hasCoarseInput ? 0.42 : 0.5,
            wobbleYSpeed: hasCoarseInput ? 0.28 : 0.34,
          }
        : {
            speedY: hasCoarseInput ? 0.075 : 0.11,
            wobbleXAmplitude: hasCoarseInput ? 0.034 : 0.048,
            wobbleYAmplitude: hasCoarseInput ? 0.018 : 0.026,
            wobbleXSpeed: hasCoarseInput ? 0.32 : 0.38,
            wobbleYSpeed: hasCoarseInput ? 0.2 : 0.24,
          };

    const updateDisplayRotation = () => {
      const motionScale = getMotionScale();
      const orbitProfile = getOrbitProfile();
      const pointerRotationX =
        !dragRef.current.active && !hasCoarseInput
          ? pointerRef.current.y * (isLitePerformance ? 0.02 : 0.035)
          : 0;
      const pointerRotationY =
        !dragRef.current.active && !hasCoarseInput
          ? pointerRef.current.x * (isLitePerformance ? 0.032 : 0.052)
          : 0;

      // Wobble and hover parallax are small, bounded screen-space tilts layered on
      // top of the real orientation. They never accumulate into it.
      const offsetX =
        (Math.sin(autoOrbitRef.current.wobbleX) * orbitProfile.wobbleXAmplitude +
          Math.cos(autoOrbitRef.current.wobbleY * 0.72) *
            orbitProfile.wobbleXAmplitude *
            0.24) *
          motionScale +
        pointerRotationX;
      const offsetY = -(
        Math.sin(autoOrbitRef.current.wobbleY) *
          orbitProfile.wobbleYAmplitude *
          motionScale +
        pointerRotationY
      );

      displayMatrixRef.current = multiply(
        rotationFromVector(offsetX, offsetY, 0),
        orientationRef.current,
      );
    };

    const applyPendingDrag = (deltaFactor: number) => {
      if (!dragRef.current.active) {
        dragDeltaRef.current.x = 0;
        dragDeltaRef.current.y = 0;
        return;
      }

      const pendingDragX = dragDeltaRef.current.x;
      const pendingDragY = dragDeltaRef.current.y;

      if (Math.abs(pendingDragX) < 0.01 && Math.abs(pendingDragY) < 0.01) {
        return;
      }

      // Drag right -> front of the ball moves right. Drag down -> front moves down.
      // Always around the screen axes, so it feels identical from any orientation.
      const rotationX = clamp(-pendingDragY * 0.0052, -0.22, 0.22);
      const rotationY = clamp(pendingDragX * 0.0052, -0.22, 0.22);
      const normalizedDeltaFactor = Math.max(deltaFactor, 0.7);

      rotateOrientation(rotationX, rotationY);
      velocityRef.current.x =
        velocityRef.current.x * 0.34 + (rotationX / normalizedDeltaFactor) * 0.66;
      velocityRef.current.y =
        velocityRef.current.y * 0.34 + (rotationY / normalizedDeltaFactor) * 0.66;
      dragDeltaRef.current.x = 0;
      dragDeltaRef.current.y = 0;
    };

    const queueStaticRender = () => {
      if (shouldAnimate || staticFrameRef.current !== 0) {
        return;
      }

      staticFrameRef.current = window.requestAnimationFrame(() => {
        staticFrameRef.current = 0;
        applyPendingDrag(1);
        updateDisplayRotation();
        drawScene();
      });
    };

    const tick = (timestamp: number) => {
      if (!visibleRef.current || !pageVisibleRef.current) {
        lastTickRef.current = null;
        frameRef.current = 0;
        return;
      }

      const delta =
        lastTickRef.current === null
          ? 16.67
          : clamp(timestamp - lastTickRef.current, 8, 32);
      const deltaFactor = delta / 16.67;
      const deltaSeconds = delta / 1000;
      lastTickRef.current = timestamp;

      const motionScale = getMotionScale();
      const pointerEase = hoverRef.current ? 0.2 : 0.08;
      const orbitProfile = getOrbitProfile();
      const isPausedByInteraction = dragRef.current.active || hoveredItemIdRef.current !== null;
      const damping = Math.pow(dragRef.current.active ? 0.86 : 0.93, deltaFactor);

      pointerRef.current.x +=
        (pointerTargetRef.current.x - pointerRef.current.x) * pointerEase;
      pointerRef.current.y +=
        (pointerTargetRef.current.y - pointerRef.current.y) * pointerEase;

      applyPendingDrag(deltaFactor);

      if (!isPausedByInteraction) {
        autoOrbitRef.current.wobbleX += orbitProfile.wobbleXSpeed * deltaSeconds;
        autoOrbitRef.current.wobbleY += orbitProfile.wobbleYSpeed * deltaSeconds;

        // Idle spin around the screen's vertical axis + leftover drag momentum.
        rotateOrientation(
          velocityRef.current.x * deltaFactor,
          velocityRef.current.y * deltaFactor -
            orbitProfile.speedY * motionScale * deltaSeconds,
        );
        velocityRef.current.x *= damping;
        velocityRef.current.y *= damping;
      }

      updateDisplayRotation();

      drawScene();
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (
        !shouldAnimate ||
        frameRef.current !== 0 ||
        !visibleRef.current ||
        !pageVisibleRef.current
      ) {
        return;
      }

      lastTickRef.current = null;
      frameRef.current = window.requestAnimationFrame(tick);
    };

    images.forEach((image, index) => {
      image.onload = () => {
        if (disposed) {
          return;
        }

        loadedIcons[index] = true;
        bakeSprite(index);
        if (shouldAnimate) {
          drawScene();
          startLoop();
        } else {
          queueStaticRender();
        }
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
      const scaleX = canvas.offsetWidth / (bounds.width || canvas.offsetWidth);
      const scaleY = canvas.offsetHeight / (bounds.height || canvas.offsetHeight);
      const localX = (event.clientX - bounds.left) * scaleX;
      const localY = (event.clientY - bounds.top) * scaleY;
      const nextX = (localX / canvas.offsetWidth - 0.5) * 2;
      const nextY = (localY / canvas.offsetHeight - 0.5) * 2;

      if (event.pointerType !== "touch") {
        pointerCanvasRef.current = {
          x: localX,
          y: localY,
          active: true,
        };
      }

      hoverRef.current = true;
      pointerTargetRef.current = {
        x: clamp(nextX, -1, 1),
        y: clamp(nextY, -1, 1),
      };

      if (dragRef.current.active && dragRef.current.pointerId === event.pointerId) {
        const events =
          typeof event.getCoalescedEvents === "function"
            ? event.getCoalescedEvents()
            : [event];

        events.forEach((entry) => {
          dragDeltaRef.current.x += entry.clientX - dragRef.current.x;
          dragDeltaRef.current.y += entry.clientY - dragRef.current.y;
          dragRef.current.x = entry.clientX;
          dragRef.current.y = entry.clientY;
        });
      }

      if (shouldAnimate) {
        startLoop();
      } else {
        queueStaticRender();
      }
    };

    const handlePointerEnter = () => {
      hoverRef.current = true;
      if (shouldAnimate) {
        startLoop();
      } else {
        queueStaticRender();
      }
    };

    const handlePointerLeave = () => {
      if (dragRef.current.active) {
        return;
      }

      hoverRef.current = false;
      pointerCanvasRef.current.active = false;
      hoveredItemIdRef.current = null;
      pointerTargetRef.current = { x: 0, y: 0 };

      if (shouldAnimate) {
        startLoop();
      } else {
        queueStaticRender();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      const scaleX = canvas.offsetWidth / (bounds.width || canvas.offsetWidth);
      const scaleY = canvas.offsetHeight / (bounds.height || canvas.offsetHeight);
      const localX = (event.clientX - bounds.left) * scaleX;
      const localY = (event.clientY - bounds.top) * scaleY;
      const nextX = (localX / canvas.offsetWidth - 0.5) * 2;
      const nextY = (localY / canvas.offsetHeight - 0.5) * 2;

      dragDeltaRef.current.x = 0;
      dragDeltaRef.current.y = 0;
      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      hoverRef.current = true;
      pointerTargetRef.current = {
        x: clamp(nextX, -1, 1),
        y: clamp(nextY, -1, 1),
      };
      pointerCanvasRef.current = {
        x: localX,
        y: localY,
        active: event.pointerType !== "touch",
      };
      canvas.setPointerCapture(event.pointerId);

      if (shouldAnimate) {
        startLoop();
      } else {
        queueStaticRender();
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (dragRef.current.pointerId !== event.pointerId) {
        return;
      }

      applyPendingDrag(1);
      dragRef.current.active = false;

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      if (hasCoarseInput || event.pointerType === "touch") {
        hoverRef.current = false;
        pointerCanvasRef.current.active = false;
        hoveredItemIdRef.current = null;
        pointerTargetRef.current = { x: 0, y: 0 };
      }

      if (shouldAnimate) {
        startLoop();
      } else {
        queueStaticRender();
      }
    };

    // Debounce resize callbacks: iOS Safari fires ResizeObserver many times during
    // rotation and keyboard show/hide, causing canvas flicker if each call resets
    // the backing store. A 16ms gate collapses bursts into one update per frame.
    let resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeDebounceTimer !== null) clearTimeout(resizeDebounceTimer);
      resizeDebounceTimer = setTimeout(() => {
        resizeDebounceTimer = null;
        resizeCanvas();
        drawScene();
      }, 16);
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
      coreGlowCache = null;
      bakeIfStale();
      drawScene();
    });

    updatePalette();
    resizeCanvas();
    updateDisplayRotation();
    drawScene();
    pageVisibleRef.current = document.visibilityState !== "hidden";

    resizeObserver.observe(stage);
    visibilityObserver?.observe(stage);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-motion-mode"],
    });

    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    if (shouldAnimate) {
      canvas.addEventListener("pointerenter", handlePointerEnter);
      canvas.addEventListener("pointerleave", handlePointerLeave);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      startLoop();
    }

    return () => {
      disposed = true;
      stopLoop();
      if (resizeDebounceTimer !== null) clearTimeout(resizeDebounceTimer);
      resizeObserver.disconnect();
      visibilityObserver?.disconnect();
      mutationObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      if (shouldAnimate) {
        canvas.removeEventListener("pointerenter", handlePointerEnter);
        canvas.removeEventListener("pointerleave", handlePointerLeave);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [
    hasCoarseInput,
    isConstrained,
    isFullPerformance,
    isLitePerformance,
    items,
    orbitalItems,
    shouldAnimate,
  ]);

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
