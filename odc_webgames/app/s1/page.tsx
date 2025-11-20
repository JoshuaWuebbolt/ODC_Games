'use client';

import React from "react";
import type { JSX } from "react";
import { useRouter } from "next/navigation";

type BoardSpaceProps = {
    size?: number; // px square (optional). If omitted, the space will be responsive and fill its parent grid cell.
    icon?: React.ReactNode;
    label?: string;
    background?: string;
    onClick?: () => void;
};

export function BoardSpace({
    size = 50,
    icon,
    label,
    background = "linear-gradient(180deg,#1f2937,#111827)",
    onClick,
}: BoardSpaceProps): JSX.Element {
    // If `size` is provided -> fixed square. If not -> responsive square (fills parent) using padding-bottom trick.
    const isFixed = typeof size === "number";

    const outerStyle: React.CSSProperties = {
        width: isFixed ? size : "100%",
        // responsive square when not fixed: use paddingBottom to enforce 1:1 aspect ratio
        paddingBottom: isFixed ? undefined : "100%",
        position: "relative",
        display: "block",
    };

    const containerStyle: React.CSSProperties = {
        // inner absolute container that is always square
        position: isFixed ? "static" : "absolute",
        inset: isFixed ? undefined : 0,
        width: isFixed ? size : "100%",
        height: isFixed ? size : "100%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background,
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(2,6,23,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        overflow: "hidden",
    };

    const iconWrapperStyle: React.CSSProperties = {
        width: "60%",
        height: "60%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e6eef8",
    };

    return (
        <div style={outerStyle} role={onClick ? "button" : "img"} aria-label={label ?? "board-space"} title={label}>
            <div style={containerStyle} onClick={onClick}>
                <div style={iconWrapperStyle}>{icon ?? <EmptyIcon />}</div>
            </div>
        </div>
    );
}

// --- new: small icon components for special spaces ---
function EmptyIcon(): JSX.Element {
    // intentionally empty visual (keeps layout space but draws nothing)
    return <span style={{ display: "block", width: "100%", height: "100%" }} />;
}

function QuestionIcon(): JSX.Element {
    return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
            <circle cx="12" cy="12" r="10" fill="#1f2937" />
            <text x="12" y="15" textAnchor="middle" fontSize="12" fill="#f8fafc" fontWeight={700}>?</text>
        </svg>
    );
}

function PlusIcon({ n = 1 }: { n?: number }): JSX.Element {
    const bg = n > 0 ? "#065f46" : "#7f1d1d";
    const fg = "#fff";
    return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
            <rect x="0" y="0" width="24" height="24" rx="4" fill={bg} />
            <text x="12" y="16" textAnchor="middle" fontSize="12" fill={fg} fontWeight={700}>{n > 0 ? `+${n}` : `${n}`}</text>
        </svg>
    );
}

function MinusTwoIcon(): JSX.Element {
    return <PlusIcon n={-2} />;
}

// Add PlayerIcon component and player state / path creation and use it in the grid & roll control
export default function XToolS1Page(): JSX.Element {
    // Build the board path here so both the grid render and roll control can access it.
    const rows = 7;
    const cols = 4;
    const path: Array<[number, number]> = [];

    // 4 to the right starting at (0,0)
    for (let i = 0; i < 4; i++) path.push([0, i]);
    // 3 down
    for (let i = 1; i <= 3; i++) path.push([i, 3]);
    // 3 to the left (positions 3,2,1)
    for (let i = 2; i >= 0; i--) path.push([3, i]);
    // 3 down (rows 4,5,6) at column 0
    for (let i = 4; i <= 6; i++) path.push([i, 0]);
    // 3 to the right at bottom row (row 6): columns 1..3
    for (let i = 1; i <= 3; i++) path.push([6, i]);

    const lastIndex = path.length - 1;

    // player position index in the path array (0 = first square)
    const [playerPos, setPlayerPos] = React.useState<number>(0);
    // Lifted roll state so the rolled number is stable and always displayed
    const [roll, setRoll] = React.useState<number | null>(null);
    // NEW: pending move when landing on a question space via roll
    const [pendingPos, setPendingPos] = React.useState<number | null>(null);

    const router = useRouter();

    // Special space definitions (1-based numbers from prompt -> converted to 0-based indices)
    const blackSpaces = new Set([1 - 1, 5 - 1, 11 - 1, 14 - 1]); // [0,4,10,13]
    const questionSpaces = new Set([2 - 1, 3 - 1, 6 - 1, 7 - 1, 9 - 1, 13 - 1, 15 - 1, 16 - 1]); // [1,2,5,6,8,12,14,15]
    const plusOneIndex = 4 - 1; // index 3
    const forwardTwoIndex = 8 - 1; // index 7
    const backwardTwoIndex = 12 - 1; // index 11

    // --- question bank + modal state (NEW) ---
    const questionBank: { q: string; options: string[]; answer: number }[] = [
        { q: "What color is the sky on a clear day?", options: ["Green", "Blue", "Red"], answer: 1 },
        { q: "How many wheels does a tricycle have?", options: ["2", "3", "4"], answer: 1 },
        { q: "Which tool cuts paper precisely?", options: ["Hammer", "Weeder", "Scissors"], answer: 2 },
        { q: "What's the safe posture when using tools?", options: ["Lean over", "Keep steady and use both hands", "Run while holding"], answer: 1 }
    ];

    const [showQuestion, setShowQuestion] = React.useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState<number | null>(null);
    const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
    const [answerFeedback, setAnswerFeedback] = React.useState<"correct" | "wrong" | null>(null);

    // Applies the effect of landing on a given space index (pos is 0-based)
    function applySpaceEffect(pos: number) {
        // black spaces: nothing happens
        if (blackSpaces.has(pos)) return;

        // question spaces: open modal with a random question
        // NOTE: this path is used when player is already on the square (e.g. clicked).
        if (questionSpaces.has(pos)) {
            const idx = Math.floor(Math.random() * questionBank.length);
            setCurrentQuestionIndex(idx);
            setSelectedAnswer(null);
            setAnswerFeedback(null);
            setShowQuestion(true);
            return;
        }

        // +1 space: show popup, then move forward one space (and check win)
        if (pos === plusOneIndex) {
            window.alert("You moved forward 1 space");
            const next = pos + 1;
            if (next > lastIndex) {
                router.push('/s1/win');
                return;
            }
            setPlayerPos(next);
            return;
        }

        // forward 2 space: show popup, then move forward 2 spaces (and check win)
        if (pos === forwardTwoIndex) {
            window.alert("You moved forward 2 spaces");
            const next = pos + 2;
            if (next > lastIndex) {
                router.push('/s1/win');
                return;
            }
            setPlayerPos(next);
            return;
        }

        // backward 2 space: show popup, then move back 2 spaces
        if (pos === backwardTwoIndex) {
            window.alert("You moved backward 2 spaces");
            const next = Math.max(pos - 2, 0);
            setPlayerPos(next);
            return;
        }

        // default: nothing special
    }

    // Called when a board space is clicked by the user
    function handleSpaceClick(idx: number) {
        // If they click a question space open the modal (no pending move)
        if (questionSpaces.has(idx)) {
            const idxQ = Math.floor(Math.random() * questionBank.length);
            setCurrentQuestionIndex(idxQ);
            setSelectedAnswer(null);
            setAnswerFeedback(null);
            setShowQuestion(true);
            return;
        }
        // Black spaces: do nothing
        if (blackSpaces.has(idx)) return;

        // +1 / forward/back spaces should show the popup and apply effect as if landed
        if (idx === plusOneIndex || idx === forwardTwoIndex || idx === backwardTwoIndex) {
            applySpaceEffect(idx);
            return;
        }

        // Optionally allow moving player to clicked space (not requested), so we'll not move on click.
    }

    function PlayerIcon(): JSX.Element {
        return (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden>
                <circle cx="12" cy="8" r="3.2" fill="#fde68a" />
                <rect x="9" y="12" width="6" height="6" rx="1" fill="#f59e0b" />
            </svg>
        );
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                // responsive padding
                padding: "clamp(12px, 3vw, 32px)",
                background: "linear-gradient(180deg,#0f172a 0%, #0b1220 100%)",
                color: "#e6eef8",
                fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            }}
        >
            <div
                style={{
                    // responsive max width
                    maxWidth: "min(720px, 92vw)",
                    width: "100%",
                    textAlign: "center",
                    borderRadius: 12,
                    padding: "clamp(16px, 4vw, 48px)",
                    background: "rgba(255,255,255,0.03)",
                    boxShadow: "0 6px 30px rgba(2,6,23,0.6)",
                }}
            >
                <h1 style={{ margin: 0, fontSize: "clamp(1.25rem, 4vw, 2rem)" }}>xTool S1</h1>
                <p style={{ marginTop: "0.5rem", color: "#cbe7ff", fontSize: "clamp(0.9rem, 2.4vw, 1rem)" }}>
                    This page is a placeholder. The xTool S1 feature is coming soon.
                </p>
                {/* BoardGame */}
                <div
                    style={{
                        marginTop: "1rem",
                        width: "100%",
                        borderRadius: 12,
                        padding: "clamp(8px, 2vw, 24px)",
                        background: "rgba(255,255,255,0.02)",
                    }}
                >
                    {/* use the precomputed path variable here instead of an IIFE */}
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${cols}, minmax(56px, 1fr))`,
                                gap: 8,
                                padding: 8,
                                width: "min(680px, 100%)",
                            }}
                        >
                            {path.map(([r, c], idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        gridColumn: c + 1,
                                        gridRow: r + 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {(() => {
                                        // decide icon for this space (overrides default)
                                        let spaceIcon: React.ReactNode | undefined = undefined;
                                        if (idx === playerPos) {
                                            // player icon takes precedence
                                            spaceIcon = <PlayerIcon />;
                                        } else if (blackSpaces.has(idx)) {
                                            spaceIcon = <EmptyIcon />;
                                        } else if (questionSpaces.has(idx)) {
                                            spaceIcon = <QuestionIcon />;
                                        } else if (idx === plusOneIndex) {
                                            spaceIcon = <PlusIcon n={1} />;
                                        } else if (idx === forwardTwoIndex) {
                                            spaceIcon = <PlusIcon n={2} />;
                                        } else if (idx === backwardTwoIndex) {
                                            spaceIcon = <MinusTwoIcon />;
                                        }

                                        return (
                                            <BoardSpace
                                                label={`Space ${idx + 1}`}
                                                icon={spaceIcon}
                                                onClick={() => handleSpaceClick(idx)}
                                                background={

                                                    questionSpaces.has(idx)
                                                            ? "linear-gradient(180deg,#1f2937,#0b1220)"
                                                            : undefined
                                                }
                                            />
                                        );
                                    })()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Roll Button with movement logic */}
                <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button
                            onClick={() => {
                                const n = Math.floor(Math.random() * 2) + 1; // 1 or 2
                                setRoll(n);
                                const next = playerPos + n;
                                if (next > lastIndex) {
                                    // moved past final square -> navigate to win page
                                    router.push('/s1/win');
                                    return;
                                }
                                if (questionSpaces.has(next)) {
                                    // defer movement until player answers correctly
                                    setPendingPos(next);
                                    const qIdx = Math.floor(Math.random() * questionBank.length);
                                    setCurrentQuestionIndex(qIdx);
                                    setSelectedAnswer(null);
                                    setAnswerFeedback(null);
                                    setShowQuestion(true);
                                    return;
                                }
                                // otherwise move immediately and apply effects
                                setPlayerPos(next);
                                // apply effect after a tick to ensure UI shows the landed square before alert (optional)
                                setTimeout(() => applySpaceEffect(next), 0);
                            }}
                            style={{
                                padding: "0.6rem 1rem",
                                borderRadius: 8,
                                border: "none",
                                background: "#2563eb",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "clamp(0.9rem, 2.2vw, 1rem)",
                            }}
                        >
                            Roll
                        </button>

                        <button
                            onClick={() => {
                                setPlayerPos(0);
                                setRoll(null);
                            }}
                            style={{
                                padding: "0.5rem 0.8rem",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.06)",
                                background: "transparent",
                                color: "#cbe7ff",
                                cursor: "pointer",
                            }}
                        >
                            Reset
                        </button>

                        <div aria-live="polite" style={{ color: "#cbe7ff", minWidth: 72, textAlign: "left" }}>
                            {roll === null ? "—" : `Result: ${roll}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Insert question modal UI (NEW)
            Place this JSX inside the component's return, near the end (overlay above board) */}
            {showQuestion && currentQuestionIndex !== null && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(2,6,23,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 60,
                    }}
                >
                    <div
                        style={{
                            width: "min(720px, 92vw)",
                            background: "#fff",
                            color: "#071124",
                            borderRadius: 12,
                            padding: 20,
                            boxShadow: "0 10px 40px rgba(2,6,23,0.6)",
                        }}
                    >
                        <h2 style={{ margin: 0, fontSize: 18 }}>Question</h2>
                        <p style={{ marginTop: 12 }}>
                            {questionBank[currentQuestionIndex].q}
                        </p>

                        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                            {questionBank[currentQuestionIndex].options.map((opt, i) => {
                                const isSelected = selectedAnswer === i;
                                const showCorrect =
                                    answerFeedback !== null && i === questionBank[currentQuestionIndex].answer;
                                const showWrong = answerFeedback !== null && isSelected && !showCorrect;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (answerFeedback !== null) return; // already answered
                                            setSelectedAnswer(i);
                                        }}
                                        style={{
                                            padding: "10px 12px",
                                            borderRadius: 8,
                                            border: "1px solid rgba(2,6,23,0.08)",
                                            background: isSelected ? "#e6f4ff" : "#fff",
                                            textAlign: "left",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 8,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span>{opt}</span>
                                        {answerFeedback !== null && showCorrect && (
                                            <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
                                        )}
                                        {answerFeedback !== null && showWrong && (
                                            <span style={{ color: "#dc2626", fontWeight: 700 }}>✕</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => {
                                    // submit answer if one selected
                                    if (selectedAnswer === null) {
                                        // simply close if no selection
                                        setShowQuestion(false);
                                        setCurrentQuestionIndex(null);
                                        setPendingPos(null);
                                        return;
                                    }
                                    const correctIndex = questionBank[currentQuestionIndex].answer;
                                    if (selectedAnswer === correctIndex) {
                                        setAnswerFeedback("correct");
                                    } else {
                                        setAnswerFeedback("wrong");
                                    }
                                }}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: "#0ea5a4",
                                    color: "#fff",
                                    cursor: "pointer",
                                }}
                            >
                                Submit
                            </button>

                            <button
                                onClick={() => {
                                    // close and clear
                                    setShowQuestion(false);
                                    setCurrentQuestionIndex(null);
                                    setSelectedAnswer(null);
                                    setAnswerFeedback(null);
                                    // discard pending move if any
                                    setPendingPos(null);
                                }}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "1px solid rgba(2,6,23,0.08)",
                                    background: "transparent",
                                    color: "#071124",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>

                        {answerFeedback !== null && (
                            <div style={{ marginTop: 12 }}>
                                {answerFeedback === "correct" ? (
                                    <div style={{ color: "#065f46", fontWeight: 700 }}>Correct!</div>
                                ) : (
                                    <div style={{ color: "#7f1d1d", fontWeight: 700 }}>Incorrect.</div>
                                )}
                                <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                    <button
                                        onClick={() => {
                                            // close after feedback
                                            if (answerFeedback === "correct" && pendingPos !== null) {
                                                // commit the deferred move
                                                setPlayerPos(pendingPos);
                                                // optionally apply further effects for the arrived space (none for question)
                                                setPendingPos(null);
                                            } else {
                                                // incorrect -> discard pending move
                                                setPendingPos(null);
                                            }
                                            // always close modal
                                            setShowQuestion(false);
                                            setCurrentQuestionIndex(null);
                                            setSelectedAnswer(null);
                                            setAnswerFeedback(null);
                                        }}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "none",
                                            background: "#2563eb",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
