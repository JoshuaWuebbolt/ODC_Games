"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STARTING_ORDER = [
    "Apply glue stick",
    "Hit Start",
    "Check plate temperature",
];

const CORRECT_ORDER = [
    "Check plate temperature",
    "Apply glue stick",
    "Hit Start",
];

export default function Page() {
    const router = useRouter();
    const [items, setItems] = useState<string[]>([...STARTING_ORDER]);
    const [message, setMessage] = useState<string | null>(null);

    // Refs for drag logic
    const containerRef = useRef<HTMLDivElement | null>(null);
    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
    const draggingIndex = useRef<number | null>(null);
    const ghostEl = useRef<HTMLDivElement | null>(null);
    const startY = useRef<number>(0);
    const pointerId = useRef<number | null>(null);
    // store global listener functions so we can remove them on clear
    const globalListeners = useRef<{ move?: (e: PointerEvent) => void; up?: (e: PointerEvent) => void }>({});

    useEffect(() => {
        // Cleanup ghost on unmount
        return () => {
            if (ghostEl.current && ghostEl.current.parentElement) {
                ghostEl.current.parentElement.removeChild(ghostEl.current);
            }
        };
    }, []);

    function moveItem(arr: string[], from: number, to: number) {
        const copy = arr.slice();
        const [item] = copy.splice(from, 1);
        copy.splice(to, 0, item);
        return copy;
    }

    function onPointerDown(e: React.PointerEvent, index: number) {
        (e.target as Element).setPointerCapture(e.pointerId);
        pointerId.current = e.pointerId;
        e.preventDefault();

        draggingIndex.current = index;
        startY.current = e.clientY;

        // create ghost element
        const sourceEl = itemRefs.current[index];
        if (!sourceEl || !containerRef.current) return;

        const rect = sourceEl.getBoundingClientRect();
        const ghost = document.createElement("div");
        ghost.textContent = items[index];
        Object.assign(ghost.style, {
            position: "fixed",
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            background: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            padding: "16px",
            zIndex: "9999",
            pointerEvents: "none",
            transform: "translateY(0px)",
            transition: "none",
            fontSize: "16px",
            fontWeight: "600",
        });
        document.body.appendChild(ghost);
        ghostEl.current = ghost;

        // add a class to source to visually hide it
        sourceEl.style.opacity = "0.15";

        // register global listeners so drag is tracked even outside the container
        globalListeners.current.move = (ev: PointerEvent) => {
            if (pointerId.current !== null && ev.pointerId !== pointerId.current) return;
            const idx = draggingIndex.current;
            if (idx === null || !ghostEl.current) return;
            ev.preventDefault();
            const deltaY = ev.clientY - startY.current;
            ghostEl.current!.style.transform = `translateY(${deltaY}px)`;

            // compute hover target index (same logic as onPointerMove)
            const children = itemRefs.current;
            let targetIndex = idx;
            for (let i = 0; i < children.length; i++) {
                const el = children[i];
                if (!el) continue;
                const r = el.getBoundingClientRect();
                const mid = r.top + r.height / 2;
                if (ev.clientY < mid) {
                    targetIndex = i;
                    break;
                } else {
                    targetIndex = i;
                }
            }

            if (targetIndex !== idx) {
                setItems((prev) => moveItem(prev, idx, targetIndex));
                draggingIndex.current = targetIndex;
                startY.current = ev.clientY;
            }
        };

        globalListeners.current.up = (ev: PointerEvent) => {
            if (pointerId.current !== null && ev.pointerId !== pointerId.current) return;
            try {
                const el = itemRefs.current[draggingIndex.current ?? -1];
                if (el && typeof el.releasePointerCapture === "function") {
                    el.releasePointerCapture(ev.pointerId);
                }
            } catch {}
            clearDrag();
        };

        window.addEventListener("pointermove", globalListeners.current.move);
        window.addEventListener("pointerup", globalListeners.current.up);
        window.addEventListener("pointercancel", globalListeners.current.up);
    }

    function onPointerMove(e: React.PointerEvent) {
        if (pointerId.current !== null && e.pointerId !== pointerId.current) return;
        const idx = draggingIndex.current;
        if (idx === null || !ghostEl.current || !containerRef.current) return;
        e.preventDefault();

        const deltaY = e.clientY - startY.current;
        ghostEl.current.style.transform = `translateY(${deltaY}px)`;

        // determine which index is being hovered over
        const containerRect = containerRef.current.getBoundingClientRect();
        const children = itemRefs.current;
        let targetIndex = idx;

        for (let i = 0; i < children.length; i++) {
            const el = children[i];
            if (!el) continue;
            const r = el.getBoundingClientRect();
            const mid = r.top + r.height / 2;
            if (e.clientY < mid) {
                targetIndex = i;
                break;
            } else {
                targetIndex = i;
            }
        }

        if (targetIndex !== idx) {
            setItems((prev) => moveItem(prev, idx, targetIndex));
            // update refs and dragging index
            draggingIndex.current = targetIndex;
            startY.current = e.clientY; // reset baseline so ghost movement remains smooth
        }
    }

    function clearDrag() {
        if (ghostEl.current && ghostEl.current.parentElement) {
            ghostEl.current.parentElement.removeChild(ghostEl.current);
        }
        ghostEl.current = null;
        if (draggingIndex.current !== null) {
            const el = itemRefs.current[draggingIndex.current];
            if (el) el.style.opacity = "1";
        }
        draggingIndex.current = null;
        pointerId.current = null;
        // remove global listeners if installed
        if (globalListeners.current.move) {
            window.removeEventListener("pointermove", globalListeners.current.move);
        }
        if (globalListeners.current.up) {
            window.removeEventListener("pointerup", globalListeners.current.up);
            window.removeEventListener("pointercancel", globalListeners.current.up);
        }
        globalListeners.current = {};
    }

    function onPointerUp(e: React.PointerEvent) {
        if (pointerId.current !== null && e.pointerId !== pointerId.current) return;
        if (draggingIndex.current !== null) {
            const el = itemRefs.current[draggingIndex.current];
            if (el) el.style.opacity = "1";
        }
        clearDrag();
    }

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (items.every((v, i) => v === CORRECT_ORDER[i])) {
            // success
            setMessage("Correct! Redirecting...");
            setTimeout(() => {
                router.push("win");
            }, 900);
        } else {
            setMessage("Incorrect order. Try again.");
            // subtle shake effect by toggling a class
            const container = containerRef.current;
            if (container) {
                container.animate(
                    [
                        { transform: "translateX(0px)" },
                        { transform: "translateX(-8px)" },
                        { transform: "translateX(8px)" },
                        { transform: "translateX(0px)" },
                    ],
                    { duration: 300 }
                );
            }
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "20px",
                boxSizing: "border-box",
                background:
                    "linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(235,243,250,1) 100%)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <header style={{ marginBottom: 12 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>How to Print</h1>
                <p style={{ margin: "6px 0 0", color: "#444" }}>Place in order</p>
            </header>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    flex: 1,
                }}
            >
                <div
                    ref={containerRef}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        marginTop: 8,
                        paddingBottom: 8,
                    }}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    {items.map((text, i) => (
                        <div
                            key={text}
                            ref={(el) => (itemRefs.current[i] = el)}
                            onPointerDown={(e) => onPointerDown(e, i)}
                            onPointerUp={onPointerUp}
                            role="button"
                            tabIndex={0}
                            aria-grabbed={draggingIndex.current === i}
                            style={{
                                background: "#fff",
                                padding: "16px",
                                borderRadius: 12,
                                boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: 16,
                                fontWeight: 600,
                                userSelect: "none",
                                touchAction: "none",
                            }}
                        >
                            <span style={{ marginRight: 12 }}>{text}</span>
                            <span
                                aria-hidden
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: "#f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#64748b",
                                    fontSize: 18,
                                }}
                            >
                                ≡
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 12 }}>
                    <button
                        type="submit"
                        onClick={() => handleSubmit()}
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            fontSize: 16,
                            fontWeight: 700,
                            borderRadius: 12,
                            border: "none",
                            background: "#0ea5e9",
                            color: "white",
                        }}
                    >
                        Submit
                    </button>
                    {message && (
                        <p
                            role="status"
                            style={{
                                marginTop: 12,
                                textAlign: "center",
                                color: message.startsWith("Correct") ? "#0f5132" : "#7f1d1d",
                                fontWeight: 600,
                            }}
                        >
                            {message}
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}