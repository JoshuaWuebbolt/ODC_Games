import React from "react";
import Link from "next/link";
import type { JSX } from "react";

export const metadata = {
  title: "You win — Cricut",
  description: "Congratulations — you found the hidden Cricut tools!",
};

export default function WinPage(): JSX.Element {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <div style={{ maxWidth: 720, textAlign: "center", borderRadius: 12, padding: "3rem", background: "linear-gradient(180deg,#06364a 0%, #052735 100%)", color: "#e6f7ff", boxShadow: "0 8px 36px rgba(2,6,23,0.6)" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>🎉 You found them all!</h1>
        <p style={{ marginTop: 12, color: "#cfeefb" }}>Nice work — you located all the tools hidden in the Cricut compartment.</p>
        <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/" style={{ display: "inline-block", padding: "10px 18px", borderRadius: 10, background: "#fff", color: "#052735", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <Link href="/cricut" style={{ display: "inline-block", padding: "10px 18px", borderRadius: 10, background: "rgba(255,255,255,0.12)", color: "#e6f7ff", textDecoration: "none", fontWeight: 600 }}>Play again</Link>
        </div>
      </div>
    </main>
  );
}
