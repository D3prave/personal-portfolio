function supportsMatchMedia() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function isAppleMobileDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  const { maxTouchPoints, platform, userAgent } = window.navigator;

  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

export function prefersReducedMotion() {
  return supportsMatchMedia()
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export function hasCoarsePointer() {
  return supportsMatchMedia()
    ? window.matchMedia("(hover: none), (pointer: coarse)").matches
    : false;
}

export function isSafariBrowser() {
  if (typeof window === "undefined") {
    return false;
  }

  const { userAgent, vendor } = window.navigator;

  return (
    vendor.includes("Apple") &&
    /Safari/i.test(userAgent) &&
    !/Chrome|CriOS|Chromium|Edg|OPR|Opera|Firefox|FxiOS/i.test(userAgent)
  );
}

export function isIOSWebKitBrowser() {
  if (typeof window === "undefined") {
    return false;
  }

  return isAppleMobileDevice() && /AppleWebKit/i.test(window.navigator.userAgent);
}

export function isConstrainedPerformanceEnvironment() {
  return (
    prefersReducedMotion() ||
    hasCoarsePointer() ||
    isSafariBrowser() ||
    isIOSWebKitBrowser()
  );
}

export function shouldUseNativeScroll() {
  return (
    prefersReducedMotion() ||
    hasCoarsePointer() ||
    isSafariBrowser() ||
    isIOSWebKitBrowser()
  );
}
