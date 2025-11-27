"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";


export default function FileTypePage() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: "wrong" | "correct" | null; message?: string }>({
        type: null,
    });

    const options = [".stl", ".jpg", ".docx"];

    function handleSelect(opt: string) {
        setSelected(opt);
        setFeedback({ type: null });
    }

    function handleSubmit() {
        if (!selected) {
            setFeedback({ type: "wrong", message: "Please select an option before submitting." });
            return;
        }

        // treat .stl as correct, others wrong — for wrong answers show what the selected format actually is
        if (selected === ".stl") {
            setFeedback({ type: "correct", message: "Correct! Redirecting..." });
            setTimeout(() => router.push("materials"), 1200);
            return;
        }

        let msg = "";
        if (selected === ".jpg") {
            msg = ".jpg is a raster image format commonly used for photos and pictures. It stores pixel data (images), not 3D model geometry — so it's not used for 3D printing.";
        } else if (selected === ".docx") {
            msg = ".docx is a Microsoft Word document format for text and rich documents. It does not contain 3D model geometry or printer instructions, so it isn't used for 3D printing.";
        } else {
            msg = `${selected} is not used for 3D printing model geometry or printer instructions. Typical 3D printing files include .stl, .obj (model meshes) and .gcode (printer instructions).`;
        }
        setFeedback({ type: "wrong", message: msg });
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>File Type</h1>
                <p style={styles.subtitle}>Guess which file type is used to print a 3D model</p>
            </header>

            <section style={styles.optionsSection}>
                <div style={styles.buttonsRow}>
                    {options.map((opt) => {
                        const isSelected = selected === opt;
                        return (
                            <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                aria-pressed={isSelected}
                                style={{ ...styles.optionButton, ...(isSelected ? styles.optionButtonSelected : {}) }}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                <button onClick={handleSubmit} style={styles.submitButton}>
                    Submit
                </button>

                {feedback.type === "wrong" && (
                    <div style={{ ...styles.feedback, color: "#b00020" }}>{feedback.message}</div>
                )}
                {feedback.type === "correct" && (
                    <div style={{ ...styles.feedback, color: "#0a8" }}>{feedback.message}</div>
                )}
            </section>

            {/* explanatory section removed — feedback now explains the selected format when incorrect */}
        </div>
    );
}

const styles: { [k: string]: React.CSSProperties } = {
    container: {
        maxWidth: 720,
        margin: "20px auto",
        padding: 16,
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial",
        color: "#111",
        width: "min(96vw, 100%)",
    },
    header: {
        marginBottom: 20,
        textAlign: 'center', // centered title/subtitle
    },
    title: { margin: 0, fontSize: "clamp(20px, 5vw, 28px)" },
    subtitle: { marginTop: 6, marginBottom: 18, color: "#444", fontSize: "clamp(13px, 3.5vw, 16px)" },
    optionsSection: {
        marginBottom: 26,
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    // make buttons responsive: grid that auto-fits columns and stacks on narrow screens
    buttonsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 10,
    },
    optionButton: {
        padding: "14px 16px",
        borderRadius: 10,
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
        width: "100%",
        boxSizing: "border-box",
        fontSize: 16,
        textAlign: "center",
        minHeight: 48,
    },
    optionButtonSelected: {
        borderColor: "#2563eb",
        background: "#e6f0ff",
    },
    submitButton: {
        marginTop: 8,
        padding: "12px 16px",
        borderRadius: 10,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
        width: "100%",
        maxWidth: 320,
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        fontSize: 16,
    },
    feedback: {
        marginTop: 10,
        fontWeight: 600,
    },
};