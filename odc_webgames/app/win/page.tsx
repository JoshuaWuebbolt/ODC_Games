import React from "react";
import Link from "next/link";

export default function WinPage() {
    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0b1220",
                color: "#fff",
                padding: 20,
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    maxWidth: 640,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                    padding: 36,
                    borderRadius: 12,
                    boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
                }}
            >
                <h1 style={{ fontSize: 48, margin: 0 }}>Congratulations! 🎉</h1>
                <p style={{ fontSize: 18, opacity: 0.9, marginTop: 12 }}>You compleated all the games! CONGRADULATIONS!!!!</p>
                <div style={{ marginTop: 24 }}>
                    <Link
                        href="/"
                        style={{
                            display: "inline-block",
                            padding: "10px 18px",
                            background: "#06b6d4",
                            color: "#012",
                            borderRadius: 8,
                            fontWeight: 600,
                            textDecoration: "none",
                        }}
                    >
                        Play again
                    </Link>
                </div>
            </div>
        </main>
    );
}