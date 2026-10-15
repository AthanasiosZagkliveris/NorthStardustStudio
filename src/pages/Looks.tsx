// First, so that the stylesheets load in the order the app's own interview page loads them (the cascade depends on it).
import "./Conversation";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { looks, type Look } from "../library/inventory/looks.generated.ts";
import "../styles/library.css";

const MODES = ["light", "dark", "sepia"] as const;

/** The measured numbers of a look as a style: the sample is a reconstruction from them, drawn with the app's own class. */
function styleOf(look: Look): CSSProperties {
    return {
        fontSize: look.font,
        fontWeight: look.weight,
        borderRadius: look.radius,
        paddingLeft: look.padL,
        paddingTop: look.padT,
        borderWidth: look.border,
        borderStyle: look.border ? "solid" : undefined,
        height: look.height ?? undefined
    };
}

function sampleOf(look: Look): ReactNode {
    const style = styleOf(look);
    switch (look.type) {
        case "text area": return <textarea className="interview-input" style={style} rows={2} defaultValue="A text area that grows with its words." aria-label="text area" />;
        case "text box": return <input className="interview-input" style={style} defaultValue="Text box" aria-label="text box" />;
        case "number box": return <input className="interview-input" style={style} inputMode="decimal" defaultValue="12" aria-label="number box" />;
        case "date cell": return <span className="date-cell" style={style}>01/01/2027</span>;
        case "dropdown": return <button type="button" className="option-picker-trigger interview-input" style={style}>Annually</button>;
        case "tick box": return <input type="checkbox" className="brand-tick-box" style={{ width: look.height ?? undefined, height: look.height ?? undefined }} defaultChecked aria-label="tick box" />;
        case "plus": return <button type="button" className="plus-box plus-box-small" style={{ width: look.height ?? undefined, height: look.height ?? undefined, borderRadius: look.radius, borderWidth: look.border }} aria-label="add" />;
        case "x": return <button type="button" className="strategy-box-remove card-remove" style={{ width: look.height ?? undefined, height: look.height ?? undefined, borderRadius: look.radius, borderWidth: look.border }} aria-label="remove" />;
        case "info": return <button type="button" className="info-note-button" style={{ width: look.height ?? undefined, height: look.height ?? undefined, fontSize: look.font }} aria-label="note">i</button>;
        case "label": return <span className="field-label" style={{ fontSize: look.font, fontWeight: look.weight }}>Start date</span>;
        default: return <span className="looks-none">(drawn by its own component)</span>;
    }
}

/**
 * THE LOOKS (development only, /library/looks): every distinct look of each kind of control as
 * the card scan measured it (Quillfield, 1920px, light), with how many were found and where.
 * A sample is a reconstruction from the measured numbers, drawn with the app's own class; the
 * number of looks excludes the width and, for a text area and a label, the height, which follow
 * the words.
 */
export default function Looks() {
    const [mode, setMode] = useState<(typeof MODES)[number]>("light");
    useEffect(() => {
        const root = document.documentElement;
        const before = root.getAttribute("data-theme");
        root.setAttribute("data-theme", mode);
        return () => { if (before) root.setAttribute("data-theme", before); else root.removeAttribute("data-theme"); };
    }, [mode]);
    const types = [...new Set(looks.map(l => l.type))];

    return (
        <main className="library-page looks-page">
            <h1>Looks</h1>
            <p>{looks.length} looks of {types.length} kinds of control, as measured. Development only.</p>
            <p>{MODES.map(m => <button key={m} type="button" className="inventory-mode" aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>)}</p>
            {types.map(type => {
                const mine = looks.filter(l => l.type === type);
                return (
                    <section key={type} className="library-asset looks-type" data-type={type}>
                        <h2>{type}: {mine.length} {mine.length === 1 ? "look" : "looks"}</h2>
                        {mine.map((look, i) => (
                            <article key={i} className="looks-look business-foundation answer-columns business-capability library-page-3">
                                <div className="looks-sample">{sampleOf(look)}</div>
                                <p className="looks-facts">
                                    <strong>Look {i + 1}: found {look.count} times.</strong> Type {look.font}px, weight {look.weight}, corners {look.radius}, padding left {look.padL} and top {look.padT}, border {look.border}
                                    {look.height !== null ? ", height " + look.height + "px" : ", height " + look.hMin + " to " + look.hMax + "px (follows the words)"}; width {look.wMin} to {look.wMax}px.
                                    <br />Classes: {look.classes.join(", ")}.
                                    <br />Where: {look.places.join("; ")}.
                                </p>
                            </article>
                        ))}
                    </section>
                );
            })}
        </main>
    );
}
