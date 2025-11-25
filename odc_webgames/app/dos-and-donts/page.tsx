import React from "react";
import type { JSX } from "react";

export const metadata = {
  title: "Do's and Don'ts",
  description: "Guidelines and tips (static HTML)",
};

export default function Page(): JSX.Element {
  return (
    <main style={{ height: "100vh", margin: 0 }}>
      {/* Embed the static HTML from /dos-and-donts.html (public folder) */}
      <iframe
        src="/dos-and-donts.html"
        title="Do's and Don'ts"
        style={{ border: 0, width: "100%", height: "100%" }}
      />
      {/* Fallback link for clients without iframe support */}
      <div style={{ display: "none" }}>
        <a href="/dos-and-donts.html">Open Do's and Don'ts</a>
      </div>
    </main>
  );
}