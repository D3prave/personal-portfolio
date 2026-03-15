const DEFAULT_ANCHOR_OFFSET = 112;

export function getAnchorOffset() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return DEFAULT_ANCHOR_OFFSET;
  }

  const rawValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--anchor-offset")
    .trim();
  const parsedValue = Number.parseFloat(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : DEFAULT_ANCHOR_OFFSET;
}
