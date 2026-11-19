import { reconcileLineIds } from "./businessFoundation/foundationPage.ts";
import { randomId } from "./Readers.ts";

/*
    THE VALUES' IDS (doc 46, section 5, step 1; the owner's approved plan of 2026-11-18, §3, B2): the Identity System's Values (`values`, a numbered list saved as one
    text, "1. ...\n2. ...") keep their text exactly as saved; each line gains an id, kept beside them line for line in `valueIds`, as the Profiles' functional
    items gained theirs (`functionalIds`, 2026-11-07). A saved answer with no ids is read with ids made from each line's words and place, the same on every read;
    an edit keeps each unchanged line's id (`reconcileLineIds`). What points at a Value (the Ambassador's BA9) points at its id, so rewording it keeps the link.
*/

/** The Values' lines as the list shows them: numbering and bullets left out, empty lines dropped. */
export function valueLines(text: unknown): string[] {
    return (typeof text === "string" ? text : "").split(/\r?\n/).map(line => line.replace(/^\s*(\d+[.)]|[-•*])\s*/, "").trim()).filter(Boolean);
}

/** An id for a Value saved with none: made from its words and its place, so reading the same answer gives the same id. */
export function valueId(text: string, index: number): string {
    let hash = 0;
    for (const char of text.trim().toLocaleLowerCase() + "#" + index) {
        hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    return "value-" + (hash >>> 0).toString(36);
}

/** The Values with their ids, read from the section's answer: those saved kept where they line up, the rest made. */
export function valuesWithIds(section: unknown): { id: string; text: string }[] {
    const value = section && typeof section === "object" && !Array.isArray(section) ? section as Record<string, unknown> : {};
    const saved = Array.isArray(value.valueIds) ? value.valueIds.map(entry => typeof entry === "string" ? entry : "") : [];
    return valueLines(value.values).map((text, index) => ({ id: saved[index] || valueId(text, index), text }));
}

/** The section's answer with its Values' text changed: their ids follow their lines (`reconcileLineIds`), a new line a new id. */
export function withValuesText(section: Record<string, unknown>, next: string): Record<string, unknown> {
    const before = valuesWithIds(section);
    const lines = valueLines(next);
    return { ...section, values: next, valueIds: reconcileLineIds(before.map(entry => entry.text), before.map(entry => entry.id), lines, () => randomId("value")) };
}
