"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// File: /d:/School/4th_year/CCT204/ODC_Games/odc_webgames/app/cricut/page.tsx

const Button: React.FC<{ label: string; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, onClick, children, style }) => (
  <button
    onClick={onClick}
    aria-label={label}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: 14,
      padding: 12,
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      width: '100%',
      height: 92,
      touchAction: 'manipulation',
      cursor: 'pointer',
      ...style,
    }}
  >
    {children}
  </button>
)

export default function CricutPage(): JSX.Element {
    type Tile = { src: string; title: string; color: string; pressed: 0 | 1; correct: 0 | 1; result?: 'none' | 'correct' | 'wrong' };

    const initialGrid: Tile[][] = [
        [
            { src: "/cricut-scraper.webp", title: "Scraper", color: "#e0e0e0", pressed: 0, correct: 1 },
            { src: "/cricut-tweezers.webp", title: "Tweezers", color: "#e0e0e0", pressed: 0, correct: 1 },
            { src: "/cricut/tile-3.webp", title: "Scissors", color: "#e0e0e0", pressed: 0, correct: 0 },
        ],
        [
            { src: "/cricut/tile-4.webp", title: "Ruler", color: "#e0e0e0", pressed: 0, correct: 0 },
            { src: "/cricut/tile-5.webp", title: "Weeder", color: "#e0e0e0", pressed: 0, correct: 0 },
            { src: "/cricut/tile-6.webp", title: "Spatula", color: "#e0e0e0", pressed: 0, correct: 0 },
        ],
        [
            { src: "/cricut/tile-7.webp", title: "Brush", color: "#e0e0e0", pressed: 0, correct: 0 },
            { src: "/cricut/tile-8.webp", title: "Scraper 2", color: "#e0e0e0", pressed: 0, correct: 0 },
            { src: "/cricut/tile-9.webp", title: "Blade", color: "#e0e0e0", pressed: 0, correct: 0 },
        ],
        [
            { src: "/cricut/tile-10.webp", title: "Mat", color: "#e0e0e0", pressed: 0, correct: 0 },
            { src: "/cricut/tile-11.webp", title: "Pen", color: "#e0e0e0", pressed: 0, correct: 0 },
            { src: "/cricut/tile-12.webp", title: "Tweezers 2", color: "#e0e0e0", pressed: 0, correct: 0 },
        ],
    ];

    const [tileGrid, setTileGrid] = useState<Tile[][]>(initialGrid);
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();

    const handleClick = (row: number, col: number) => {
        // Allow toggling even after submit.
        // Clear any previous per-tile results and flip the pressed state for the clicked tile.
        setTileGrid(prev =>
            prev.map((rArr, rIdx) =>
                rArr.map((tile, cIdx) => {
                    // clear any result for all tiles
                    if (rIdx === row && cIdx === col) {
                        return { ...tile, pressed: tile.pressed === 1 ? 0 : 1, result: undefined };
                    }
                    return { ...tile, result: undefined };
                })
            )
        );
        // Return UI to selection mode so user can change and resubmit
        setSubmitted(false);
    };

    const handleSubmit = () => {
        if (submitted) return;

        // Snapshot current counts from the state (before we update results)
        const flat = tileGrid.flat();
        const totalCorrectNow = flat.filter(t => t.correct === 1).length;
        const selectedCorrectNow = flat.filter(t => t.correct === 1 && t.pressed === 1).length;
        const selectedIncorrectNow = flat.filter(t => t.correct === 0 && t.pressed === 1).length;

        // Mark submitted so UI becomes read-only
        setSubmitted(true);

        // Update each tile's result:
        // - selected correct  => 'correct'
        // - selected incorrect => 'wrong'
        // - unselected tiles => 'none' (including unselected correct)
        setTileGrid(prev =>
            prev.map(row =>
                row.map(tile => {
                    if (tile.pressed === 1) {
                        return { ...tile, result: tile.correct === 1 ? "correct" : "wrong" };
                    }
                    // unselected tiles: do not mark them green — keep as 'none'
                    return { ...tile, result: "none" };
                })
            )
        );

        // If the user selected all correct tiles and no incorrect tiles, redirect
        if (selectedCorrectNow === totalCorrectNow && selectedIncorrectNow === 0 && totalCorrectNow > 0) {
            setTimeout(() => {
                router.push('/cricut/win'); // redirect to nested win page
            }, 700);
        }
    };

    // simple helper to return a placeholder image URL (public picsum)
    const imgUrl = (seed: number, w = 400, h = 300) =>
        `https://picsum.photos/seed/${seed}/${w}/${h}`;

    return (
        <main style={styles.page}>
            {/* Top header: image on the left, text takes remaining space to the right */}
            <header style={styles.header}>
              <Image
                src="/cricut-drawer-open.webp"
                alt="Picture of Cricut Machine with drawer open"
                width={1200}
                height={800}
                style={{ width: '33%', height: 'auto', maxHeight: '300px' }}
                priority
              />
            <h1 style={{ margin: 0 }}>Cricut Hidden Tools</h1>
            </header>

            <div style={styles.headerText}>

                <p style={{ marginTop: 8, color: "#333" }}>
                    To win this game you must select all the tools hidden inside the side 
                    compartment of the Cricut machine. Once you've selected all the tools,
                    press the "Submit" button to see if you found them all!
                </p>
            </div>
            <section style={styles.gridWrap}>
                {tileGrid.map((rowArr, row) =>
                    rowArr.map(({ src, title, color, pressed, correct, result }, col) => {
                        const idx = row * 3 + col; // 0..11
                        const seed = idx + 1;
                        const imageSrc = src ?? "/cricut-scraper.webp";
                        const label = title ?? `Design ${seed}`;
                        const bg = color ?? "#ffffff";

                        // small helper to decide readable text color on top of bg
                        const hexToRgb = (hex: string) => {
                            const h = hex.replace("#", "");
                            const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
                            const r = parseInt(full.slice(0, 2), 16);
                            const g = parseInt(full.slice(2, 4), 16);
                            const b = parseInt(full.slice(4, 6), 16);
                            return { r, g, b };
                        };
                        const isLight = (() => {
                            try {
                                const { r, g, b } = hexToRgb(bg);
                                // relative luminance approximation
                                const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                                return lum > 160;
                            } catch {
                                return true;
                            }
                        })();
                        const overlayTextColor = isLight ? "#111827" : "#ffffff";

                        // Determine overlays:
                        // - selection mode: pressed -> grey overlay
                        // - after submission: correct -> green, wrong -> red, others -> subtle dim
                        const overlayStyle: React.CSSProperties | null = (() => {
                            if (!submitted) {
                                if (pressed === 1) return { background: "rgba(0,0,0,0.28)" }; // grey tint while selecting
                                return null;
                            }
                            // after submit: respect per-tile result
                            if (result === "correct") return { background: "rgba(34,197,94,0.22)" }; // green (selected correct)
                            if (result === "wrong") return { background: "rgba(239,68,68,0.22)" }; // red (selected wrong)
                            return { background: "rgba(0,0,0,0.06)" }; // neutral dim for non-selected tiles
                        })();

                        // Bold border when selected (before submit). After submit, ring colors follow result.
                        const ringStyle: React.CSSProperties | undefined = (() => {
                            if (!submitted) {
                                if (pressed === 1) {
                                    return {
                                        border: '3px solid rgba(15,23,42,0.9)',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                                    };
                                }
                                return undefined;
                            }
                            if (result === "correct") {
                                return { boxShadow: "inset 0 0 0 3px rgba(34,197,94,0.18), 0 12px 30px rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.12)" };
                            }
                            if (result === "wrong") {
                                return { boxShadow: "inset 0 0 0 3px rgba(239,68,68,0.18), 0 12px 30px rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" };
                            }
                            return undefined;
                        })();

                        // Button base recolor on submit: tint the whole button background based on result.
                        // Only applies after submit so selection look (bold border) is preserved before submit.
                        const buttonBaseStyle: React.CSSProperties | undefined = (() => {
                            if (!submitted) return undefined;
                            if (result === "correct") return { background: "rgba(34,197,94,0.06)" };
                            if (result === "wrong") return { background: "rgba(239,68,68,0.06)" };
                            return { background: "transparent" };
                        })();

                        return (
                             <button
                                 key={seed}
                                 onClick={() => handleClick(row, col)}
                                 // merge: base tile styles, an optional base recolor (after submit), the original bg, then ring (borders/shadows)
                                 style={{ ...styles.tile, ...(buttonBaseStyle ?? {}), background: bg, ...ringStyle }}
                                 aria-label={label}
                             >
                                <div style={{ position: "relative", width: "100%", paddingBottom: "66.666%", borderRadius: 8, overflow: "hidden" }}>
                                    <Image
                                        src={imageSrc}
                                        alt={label}
                                        fill
                                        style={{ objectFit: "cover", opacity: 0.98 }}
                                        priority={seed <= 3}
                                    />
                                    {/* neutral base overlay inside image container (keeps contrast stable) */}
                                    <div
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            pointerEvents: "none",
                                            background: "transparent",
                                            mixBlendMode: "normal",
                                        }}
                                    />
                                    {/* show overlay (selection or result) */}
                                    {overlayStyle && (
                                        <div
                                            aria-hidden
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                pointerEvents: "none",
                                                ...overlayStyle,
                                                borderRadius: 8,
                                            }}
                                        />
                                    )}
                                </div>
                               
                                <div
                                    style={{
                                        ...styles.tileOverlay,
                                        color: overlayTextColor,
                                        // subtle tinted overlay to improve contrast on all backgrounds
                                        background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${isLight ? "rgba(0,0,0,0.24)" : "rgba(0,0,0,0.45)"} 100%)`,
                                    }}
                                >
                                    <span style={styles.tileLabel}>{label}</span>
                                </div>
                            </button>
                        );
                    })
                )}
            </section>
            <section>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
                    <div style={{ width: '72%' }}>
                        <Button label="Submit selection" onClick={handleSubmit}>
                          <span style={{ fontSize: 16, color: '#111827' }}>Submit</span>
                        </Button>
                    </div>
                </div>
            </section>

        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        padding: 20,
        fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        maxWidth: 1100,
        margin: "0 auto",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: 20,
        marginBottom: 24,
    },
    headerImage: {
        width: 320,
        height: 220,
        objectFit: "cover",
        borderRadius: 8,
        flexShrink: 0,
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    },
    headerText: {
        flex: 1,
        minWidth: 0,
    },
    gridWrap: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
    },
    tile: {
        position: "relative",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
    },
    tileImage: {
        width: "100%",
        height: 0,
        paddingBottom: "66.666%" // 3:2 aspect ratio
        ,
        objectFit: "cover",
        display: "block",
    },
    tileOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "8px 10px",
        background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)",
        color: "white",
    },
    tileLabel: {
        fontSize: 14,
        fontWeight: 600,
    },
};

// Add small hover/focus styles via a side-effect style injection for simplicity
// (Keeps this file self-contained)
const sheet = (() => {
    if (typeof document === "undefined") return null;
    const s = document.createElement("style");
    s.innerHTML = `
        main button:focus { outline: 3px solid rgba(59,130,246,0.5); outline-offset: 2px; }
        main button:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
    `;
    document.head.appendChild(s);
    return s;
})();