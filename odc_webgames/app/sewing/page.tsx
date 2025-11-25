import React from "react";
import type { JSX } from "react";

export const metadata = {
  title: "Sewing Machine - Thread it Right",
  description: "Guidelines and tips (static HTML)",
};

export default function Page(): JSX.Element {
  return (
    <main style={{ height: "100vh", margin: 0 }}>
      {/* Embed the static HTML from /dos-and-donts.html (public folder) */}
      <iframe
        src="/sewingmachine.html"
        title="Sewing Machine - Thread it Right"
        style={{ border: 0, width: "100%", height: "100%" }}
      />
      {/* Fallback link for clients without iframe support */}
      <div style={{ display: "none" }}>
        <a href="/sewingmachine.html">Open Sewing Machine</a>
      </div>
    </main>
  );
}