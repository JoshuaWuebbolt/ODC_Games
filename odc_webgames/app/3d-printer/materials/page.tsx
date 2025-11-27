'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'




type Item = { id: string; label: string }

const materials: Item[] = [
    { id: 'pla', label: 'PLA' },
    { id: 'abs', label: 'ABS' },
    { id: 'petg', label: 'PETG' },
    { id: 'pva', label: 'PVA' },
    { id: 'tpu', label: 'TPU' },
]

const uses: Item[] = [
    { id: 'heat_resistant', label: 'Functional Heat Resistant Parts' },
    { id: 'water_resistant', label: 'Strong Water Resistant Parts' },
    { id: 'water_soluble', label: 'Water Soluble Parts' },
    { id: 'prototyping', label: 'Beginner Prototyping' },
    { id: 'flexible', label: 'Flexible/Bendable Parts' },
]

// correct mapping: materialId -> useId
const correctMap: Record<string, string> = {
    pla: 'prototyping',
    abs: 'heat_resistant',
    petg: 'water_resistant',
    pva: 'flexible',
    tpu: 'water_soluble',
}

type Line = {
    id: string
    from: string
    to: string
    x1: number
    y1: number
    x2: number
    y2: number
    correct: boolean
}

export default function Page() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement | null>(null)
    // overlayRef is the inner relative container that the lines are positioned against
    const overlayRef = useRef<HTMLDivElement | null>(null)
    const materialRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const useRefs = useRef<Record<string, HTMLDivElement | null>>({})

    const [activeSource, setActiveSource] = useState<string | null>(null)
    const [lines, setLines] = useState<Line[]>([])
    const [matchedSources, setMatchedSources] = useState<Record<string, boolean>>({})
    const [matchedUses, setMatchedUses] = useState<Record<string, boolean>>({})
    const [tempPos, setTempPos] = useState<{ x: number; y: number } | null>(null) // for live drawing while cursor moves

    // return viewport (client) coordinates for element center so lines can be drawn anywhere on the page
    const getCenter = (el: HTMLElement | null) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
        }
    }

    const startFromMaterial = (id: string) => {
        if (matchedSources[id]) return
        setActiveSource(id)
        const el = materialRefs.current[id]
        const c = getCenter(el)
        if (c) setTempPos({ x: c.x, y: c.y })
        // attach mousemove to update temp line end
    }

    const finishOnUse = (useId: string) => {
        if (!activeSource) return
        if (matchedUses[useId] || matchedSources[activeSource]) {
            // already matched, ignore
            setActiveSource(null)
            setTempPos(null)
            return
        }
        const fromEl = materialRefs.current[activeSource]
        const toEl = useRefs.current[useId]
        const cFrom = getCenter(fromEl)
        const cTo = getCenter(toEl)
        if (!cFrom || !cTo) {
            setActiveSource(null)
            setTempPos(null)
            return
        }
        const correct = correctMap[activeSource] === useId
        const id = `${activeSource}--${useId}`
        const newLine: Line = {
            id,
            from: activeSource,
            to: useId,
            x1: cFrom.x,
            y1: cFrom.y,
            x2: cTo.x,
            y2: cTo.y,
            correct,
        }
        if (correct) {
            setLines((s) => [...s, newLine])
            setMatchedSources((m) => ({ ...m, [activeSource]: true }))
            setMatchedUses((m) => ({ ...m, [useId]: true }))
            setActiveSource(null)
            setTempPos(null)
        } else {
            // show red briefly then remove
            setLines((s) => [...s, { ...newLine, correct: false }])
            setActiveSource(null)
            setTempPos(null)
            setTimeout(() => {
                setLines((s) => s.filter((l) => l.id !== id))
            }, 800)
        }
    }

    useEffect(() => {
        // pointermove updates temp line end while dragging using viewport coords
        function onPointerMove(e: PointerEvent) {
            if (!activeSource) return
            setTempPos({ x: e.clientX, y: e.clientY })
        }

        // pointerup attempts to drop onto a use element; otherwise cancels.
        // Also release pointer capture on the source element to avoid stuck capture.
        function onPointerUp(e: PointerEvent) {
            if (!activeSource) return

            try {
                const srcEl = materialRefs.current[activeSource]
                if (srcEl && typeof srcEl.releasePointerCapture === 'function') {
                    srcEl.releasePointerCapture(e.pointerId)
                }
            } catch {
                // ignore release errors
            }

            const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
            const useEl = el?.closest('[data-use-id]') as HTMLElement | null
            if (useEl) {
                finishOnUse(useEl.dataset.useId!)
            } else {
                // cancelled / not dropped on a use
                setActiveSource(null)
                setTempPos(null)
            }
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
        window.addEventListener('pointercancel', onPointerUp)
        return () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
            window.removeEventListener('pointercancel', onPointerUp)
        }
    }, [activeSource])

    // Recompute positions on resize (so persisted lines keep correct coords)
    useEffect(() => {
        const onResize = () => {
            // rebuild positions for existing correct lines
            setLines((current) =>
                current.map((l) => {
                    const cFrom = getCenter(materialRefs.current[l.from])
                    const cTo = getCenter(useRefs.current[l.to])
                    if (!cFrom || !cTo) return l
                    return { ...l, x1: cFrom.x, y1: cFrom.y, x2: cTo.x, y2: cTo.y }
                })
            )
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // check win
    useEffect(() => {
        const correctCount = lines.filter((l) => l.correct).length
        if (correctCount === materials.length) {
            // congrats then redirect
            setTimeout(() => {
                alert('Congratulations! All answers are correct.')
                router.push('print-order')
            }, 400)
        }
    }, [lines, router])

    // shared base style for material/use boxes so they match size/layout
    const boxBase: React.CSSProperties = {
        padding: '12px 16px',
        borderRadius: 8,
        border: '1px solid #ddd',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 64,
        maxHeight: 64,
        width: 'min(360px, 100%)', // responsive: fill on small screens, capped on wide screens
        alignSelf: 'center',       // center each box in its column/grid cell
        boxSizing: 'border-box',
        touchAction: 'none',
    }

    return (
        <div
            ref={containerRef}
            style={{
                padding: 24,
                minHeight: '100vh',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
            }}
        >
            <h1 style={{ margin: 0 }}>3D Printer Materials Matching</h1>
            <p style={{ marginTop: 8, color: '#555' }}>
                Click a material on the left, then click the matching use on the right. Correct matches turn green.
            </p>

            <div ref={overlayRef} style={{ position: 'relative', marginTop: 24 }}>
                {/* SVG overlay for lines (fixed to viewport so we can draw anywhere) */}
                <svg
                    style={{
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        pointerEvents: 'none',
                        width: '100vw',
                        height: '100vh',
                        overflow: 'visible',
                        zIndex: 999, // ensure lines render above materials/uses
                    }}
                >
                    {lines.map((l) => (
                        <line
                            key={l.id}
                            x1={l.x1}
                            y1={l.y1}
                            x2={l.x2}
                            y2={l.y2}
                            stroke={l.correct ? 'green' : 'red'}
                            strokeWidth={4}
                            strokeLinecap="round"
                        />
                    ))}
                    {activeSource && tempPos && (
                        <line
                            x1={getCenter(materialRefs.current[activeSource])?.x ?? tempPos.x}
                            y1={getCenter(materialRefs.current[activeSource])?.y ?? tempPos.y}
                            x2={tempPos.x}
                            y2={tempPos.y}
                            stroke="#333"
                            strokeWidth={3}
                            strokeDasharray="6 6"
                            strokeLinecap="round"
                        />
                    )}
                </svg>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 16,
                        alignItems: 'start',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <div>
                        <h3 style={{ marginBottom: 8 }}>Materials</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {materials.map((m) => (
                                <div
                                    key={m.id}
                                    ref={(el) => (materialRefs.current[m.id] = el)}
                                    onPointerDown={(e) => {
                                        if (matchedSources[m.id]) return
                                        e.preventDefault()
                                        // capture the pointer on the source so we reliably receive move/up
                                        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch {}
                                        // anchor start to material center (viewport coords)
                                        const center = getCenter(materialRefs.current[m.id])
                                        if (center) {
                                            setTempPos({ x: center.x, y: center.y })
                                        } else {
                                            // fallback to client coordinates
                                            setTempPos({ x: e.clientX, y: e.clientY })
                                        }
                                        setActiveSource(m.id)
                                    }}
                                    style={{
                                        ...boxBase, // use shared sizing
                                        background: matchedSources[m.id] ? '#eef8ee' : activeSource === m.id ? '#f0f8ff' : '#fff',
                                        cursor: matchedSources[m.id] ? 'default' : 'pointer',
                                        boxShadow: activeSource === m.id ? '0 0 0 3px rgba(0,123,255,0.08)' : undefined,
                                    }}
                                >
                                    {m.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: 8 }}>Uses</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {uses.map((u) => (
                                <div
                                    key={u.id}
                                    ref={(el) => (useRefs.current[u.id] = el)}
                                    data-use-id={u.id}
                                    onPointerDown={(e) => {
                                        if (activeSource) {
                                            e.preventDefault()
                                            finishOnUse(u.id)
                                            try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId) } catch {}
                                        }
                                    }}
                                    style={{
                                        ...boxBase, // same shared sizing so boxes match
                                        background: matchedUses[u.id] ? '#eef8ee' : '#fff',
                                        cursor: 'pointer',
                                        opacity: matchedUses[u.id] ? 0.8 : 1,
                                    }}
                                >
                                    {u.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
 }