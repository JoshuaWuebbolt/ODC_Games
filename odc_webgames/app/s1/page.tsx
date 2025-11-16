import React from "react";
import type { JSX } from "react";

export const metadata = {
    title: "xTool S1 — Placeholder",
    description: "Placeholder page for the xTool S1 section of the site",
};

export default function XToolS1Page(): JSX.Element {
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
                    maxWidth: 720,
                    textAlign: "center",
                    borderRadius: 12,
                    padding: "3rem",
                    background: "rgba(255,255,255,0.03)",
                    boxShadow: "0 6px 30px rgba(2,6,23,0.6)",
                }}
            >
                <h1 style={{ margin: 0, fontSize: "2rem" }}>xTool S1</h1>
                <p style={{ marginTop: "0.5rem", color: "#cbe7ff" }}>
                    This page is a placeholder. The xTool S1 feature is coming soon.
                </p>
                <p style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "#9fb9d9" }}>
                    Path: /s1
                </p>
            </div>
        </main>
    );
}
