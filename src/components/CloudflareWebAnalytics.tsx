import { useEffect } from "react";

const CLOUDFLARE_BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

export function CloudflareWebAnalytics() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const analyticsToken =
      import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();

    if (!analyticsToken) {
      return;
    }

    const existingBeacon = document.querySelector<HTMLScriptElement>(
      `script[src^="${CLOUDFLARE_BEACON_SRC}"]`,
    );

    if (existingBeacon) {
      return;
    }

    const script = document.createElement("script");
    script.defer = true;
    script.src = CLOUDFLARE_BEACON_SRC;
    script.setAttribute(
      "data-cf-beacon",
      JSON.stringify({
        token: analyticsToken,
        spa: false,
      }),
    );

    document.head.append(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
