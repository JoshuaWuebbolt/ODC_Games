import React from "react";
import type { JSX } from "react";

export const metadata = {
    title: "Dos and Don'ts — ODC",
    description: "Guidelines: Dos and Don'ts for using ODC games and site features",
};

export default function DosAndDontsPage(): JSX.Element {
    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                background: "linear-gradient(180deg,#0f172a 0%, #0b1220 100%)",
                color: "#e6eef8",
                fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            }}
        >
            <div
                style={{
                    maxWidth: 900,
                    width: "100%",
                    textAlign: "left",
                    borderRadius: 12,
                    padding: "2.5rem",
                    background: "rgba(255,255,255,0.03)",
                    boxShadow: "0 6px 30px rgba(2,6,23,0.6)",
                }}
            >
                <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Dos and Don'ts</h1>
                <p style={{ marginTop: "0.5rem", color: "#cbe7ff" }}>
                    Helpful guidelines for players and contributors.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1.5rem",
                        marginTop: "1.5rem",
                    }}
                >
                    <section
                        aria-labelledby="dos-heading"
                        style={{
                            background: "rgba(99,179,237,0.06)",
                            padding: "1rem",
                            borderRadius: 8,
                        }}
                    >
                        <h2 id="dos-heading" style={{ margin: 0, fontSize: "1.1rem", color: "#aee6ff" }}>
                            ✅ Dos
                        </h2>
                        <ul style={{ marginTop: "0.75rem", lineHeight: 1.6 }}>
                            <li>Impliment this page</li>

                        </ul>
                    </section>

                    <section
                        aria-labelledby="donts-heading"
                        style={{
                            background: "rgba(255,109,109,0.03)",
                            padding: "1rem",
                            borderRadius: 8,
                        }}
                    >
                        <h2 id="donts-heading" style={{ margin: 0, fontSize: "1.1rem", color: "#ffd3d3" }}>
                            ❌ Don'ts
                        </h2>
                        <ul style={{ marginTop: "0.75rem", lineHeight: 1.6 }}>
                            <li>Don't kill people</li>
                        </ul>
                    </section>
                </div>

                <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#9fb9d9" }}>
                    Path: /dos-and-donts
                </p>
            </div>
        </main>
    );
}
