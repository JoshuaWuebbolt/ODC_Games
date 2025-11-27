"use client";
import React, { useState, useRef, useEffect } from "react";

type Token = {
    id: number;
    left: number;
    top: number;
    scale: number;
    duration: number;
    delay: number;
    hue: number;
    spinDir: number;
    blur: number;
};

export default function Page() {
    // generate a bunch of floating 3D text tokens once
    const [tokens] = useState<Token[]>(
        () =>
            Array.from({ length: 22 }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                top: Math.random() * 100,
                scale: 0.6 + Math.random() * 2.2,
                duration: 6 + Math.random() * 10,
                delay: Math.random() * -8,
                hue: Math.floor(Math.random() * 360),
                spinDir: Math.random() > 0.5 ? 1 : -1,
                blur: Math.random() * 6,
            }))
    );

    // add refs for measuring and a small effect to compute scale
    const centerRef = useRef<HTMLDivElement | null>(null);
    const mainRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!centerRef.current || !mainRef.current) return;

        const computeAndSetScale = () => {
            const container = centerRef.current!;
            const text = mainRef.current!;
            // available width inside center (leave small padding)
            const available = Math.max(24, container.clientWidth - 32);
            const textWidth = text.scrollWidth || text.getBoundingClientRect().width || 0;
            const scale = textWidth > 0 ? Math.min(1, available / textWidth) : 1;
            container.style.setProperty("--main-scale", String(scale));
        };

        // initial compute
        computeAndSetScale();

        // observe resizes of the center container and window
        const ro = new ResizeObserver(computeAndSetScale);
        ro.observe(centerRef.current);
        window.addEventListener("resize", computeAndSetScale);

        // also observe font/load changes on the text itself
        const roText = new ResizeObserver(computeAndSetScale);
        roText.observe(mainRef.current);

        return () => {
            ro.disconnect();
            roText.disconnect();
            window.removeEventListener("resize", computeAndSetScale);
        };
    }, [/* tokens don't affect headline sizing */]);

    return (
        <main className="party">
            <div className="center" ref={centerRef}>
                {/* attach ref to headline so we can measure it */}
                <div className="main-3d" ref={mainRef}>CONGRADULATIONS</div>
                <div className="subtitle">It is currently 4:21AM. I don't want to do this anymore.</div>
            </div>

            {tokens.map((t) => (
                <div
                    key={t.id}
                    className="floating"
                    style={
                        {
                            // custom properties for each token
                            ["--left" as any]: `${t.left}%`,
                            ["--top" as any]: `${t.top}%`,
                            ["--s" as any]: t.scale,
                            ["--d" as any]: `${t.duration}s`,
                            ["--delay" as any]: `${t.delay}s`,
                            ["--h" as any]: `${t.hue}deg`,
                            ["--spin" as any]: t.spinDir,
                            ["--blur" as any]: `${t.blur}px`,
                        } as React.CSSProperties
                    }
                >
                    CONGRADULATIONS
                </div>
            ))}

            <style>{`
                :root {
                    --bg-anim-speed: 12s;
                    --main-scale: 1; /* default */
                }

                html,body,#__next {
                    height: 100%;
                }

                .party {
                    position: fixed;
                    inset: 0;
                    overflow: hidden;
                    perspective: 1200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: "Impact", "Segoe UI", Roboto, system-ui, -apple-system, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    /* insane animated background */
                    background: linear-gradient(120deg, hsl(0 100% 60%), hsl(50 100% 60%), hsl(200 100% 60%));
                    background-size: 600% 600%;
                    animation: bgShift var(--bg-anim-speed) linear infinite, huePulse 8s linear infinite;
                    filter: saturate(1.5) contrast(1.15);
                }

                @keyframes bgShift {
                    0% { background-position: 0% 50%;}
                    25% { background-position: 50% 100%;}
                    50% { background-position: 100% 50%;}
                    75% { background-position: 50% 0%;}
                    100% { background-position: 0% 50%;}
                }

                @keyframes huePulse {
                    0% { filter: hue-rotate(0deg); }
                    50% { filter: hue-rotate(90deg) saturate(1.6); }
                    100% { filter: hue-rotate(0deg); }
                }

                /* center headline */
                .center {
                    position: relative;
                    z-index: 50;
                    text-align: center;
                    pointer-events: none;
                    transform: translateZ(120px);
                    /* ensure the center is a reliable measurement box */
                    box-sizing: border-box;
                    padding: 0 16px;
                }

                .main-3d {
                    /* make headline never wrap and be measured correctly */
                    white-space: nowrap;
                    max-width: 100%;
                    display: inline-block;
                    box-sizing: content-box;
                    /* apply scale variable into the base transform (animations updated below) */
                    transform: translateZ(120px) scale(var(--main-scale, 1));
                    font-size: clamp(48px, 10vw, 180px);
                    color: white;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    padding: 8px 16px;
                    transform-style: preserve-3d;
                    animation: mainJiggle 1.6s infinite ease-in-out;
                    mix-blend-mode: screen;
                    text-shadow:
                        0 1px 0 rgba(255,255,255,0.85),
                        0 6px 8px rgba(0,0,0,0.45),
                        0 12px 30px rgba(0,0,0,0.6);
                    -webkit-text-stroke: 2px rgba(0,0,0,0.12);
                    background: linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,0,0.8), rgba(255,0,170,0.9));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 6px 10px rgba(0,0,0,0.6));
                }

                @keyframes mainJiggle {
                    0% { transform: translateZ(120px) rotateX(45deg) rotateY(-90deg) rotateZ(-45deg) scale(var(--main-scale, 1)); }
                    50% { transform: translateZ(140px) rotateX(-45deg) rotateY(90deg) rotateZ(45deg) scale(calc(var(--main-scale, 1) * 1.02)); }
                    100% { transform: translateZ(120px) rotateX(45deg) rotateY(-90deg) rotateZ(-45deg) scale(var(--main-scale, 1)); }
                }

                .subtitle {
                    margin-top: 6px;
                    font-size: clamp(12px, 2.6vw, 20px);
                    color: rgba(255,255,255,0.95);
                    text-shadow: 0 2px 6px rgba(0,0,0,0.45);
                    mix-blend-mode: lighten;
                    letter-spacing: 0.06em;
                }

                /* floating repeated 3D texts */
                .floating {
                    position: absolute;
                    left: var(--left);
                    top: var(--top);
                    transform-style: preserve-3d;
                    transform-origin: center;
                    font-weight: 900;
                    font-size: calc(12px * var(--s));
                    padding: 6px 12px;
                    text-transform: uppercase;
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 30;
                    color: hsl(var(--h) 90% 60%);
                    -webkit-text-stroke: 0.8px rgba(0,0,0,0.18);
                    filter: drop-shadow(0 8px 12px rgba(0,0,0,0.5)) blur(var(--blur));
                    mix-blend-mode: screen;
                    animation:
                        floatMove var(--d) var(--delay) linear infinite,
                        spin calc(var(--d) * 0.7) var(--delay) linear infinite,
                        hueShift 6s calc(var(--delay) * -1) linear infinite;
                    text-shadow:
                        0 1px 0 rgba(255,255,255,0.6),
                        0 3px 8px rgba(0,0,0,0.6),
                        0 10px 30px rgba(0,0,0,0.5);
                    border-radius: 8px;
                    padding-inline: 10px;
                    letter-spacing: 0.08em;
                    transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 40px)) scale(var(--s));
                }

                @keyframes floatMove {
                    0% {
                        transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 40px)) translateY(0) translateX(0) rotate(0deg) scale(var(--s));
                        opacity: 0.5;
                    }
                    25% {
                        transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 80px)) translateY(-30vh) translateX(12vw) rotate(12deg) scale(calc(var(--s) * 1.08));
                        opacity: 1;
                    }
                    50% {
                        transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 20px)) translateY(18vh) translateX(-18vw) rotate(-28deg) scale(calc(var(--s) * 0.92));
                        opacity: 0.85;
                    }
                    75% {
                        transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 90px)) translateY(-8vh) translateX(20vw) rotate(24deg) scale(calc(var(--s) * 1.06));
                        opacity: 1;
                    }
                    100% {
                        transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 40px)) translateY(0) translateX(0) rotate(0deg) scale(var(--s));
                        opacity: 0.6;
                    }
                }

                @keyframes spin {
                    0% { transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 40px)) rotate3d(var(--spin), 0.6, 0.2, 0deg); }
                    50% { transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 70px)) rotate3d(var(--spin), 0.6, 0.3, 180deg); }
                    100% { transform: translate3d(-50%, -50%, 0) translateZ(calc(var(--s) * 40px)) rotate3d(var(--spin), 0.6, 0.2, 360deg); }
                }

                @keyframes hueShift {
                    0% { filter: hue-rotate(0deg) saturate(1.2); }
                    50% { filter: hue-rotate(180deg) saturate(1.6); }
                    100% { filter: hue-rotate(360deg) saturate(1.2); }
                }

                /* tiny responsive tweaks to make it more chaotic on small screens */
                @media (max-width: 600px) {
                    .main-3d {
                        font-size: clamp(36px, 22vw, 96px);
                        -webkit-text-stroke: 1px rgba(0,0,0,0.12);
                    }
                    .floating { font-size: calc(10px * var(--s)); }
                }

                /* a blinking overlay for extra intensity */
                .party::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background: radial-gradient(circle at 20% 10%, rgba(255,255,255,0.06), transparent 10%),
                                            radial-gradient(circle at 80% 90%, rgba(255,255,255,0.04), transparent 12%);
                    mix-blend-mode: overlay;
                    animation: pulseOverlay 3.2s infinite linear;
                    z-index: 40;
                }

                @keyframes pulseOverlay {
                    0% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.02); }
                    100% { opacity: 0.6; transform: scale(1); }
                }
            `}</style>
        </main>
    );
}