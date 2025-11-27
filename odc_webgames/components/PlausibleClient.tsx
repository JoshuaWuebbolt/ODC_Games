"use client";
import { useEffect } from "react";

export default function PlausibleClient() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("@plausible-analytics/tracker");
        if (cancelled) return;
        if (mod && typeof mod.init === "function") {
          mod.init({ domain: "odc-games-nu.vercel.app" });
        }
      } catch (err) {
        // fail silently in case of environment issues
        // console.error(err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return null;
}
