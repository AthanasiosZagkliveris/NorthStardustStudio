import { describe, expect, it } from "vitest";

/*
    NO PAGE IS WRITTEN WITH A FIXED NUMBER (ai-collaboration-rules.md, "Read the app's structure by what a thing is"; owner, 2026-11-19): a text the app shows
    names a page or a chapter by its name ("1. Identity System → Definition & Purpose → Founders & Ownership"), never by a number written into it
    ("→ 3. Legal Entity", "under 2. Activities"): a page's number is its place in the rail, worked out when it is drawn, and it moves when pages are joined. A
    System keeps its number, which is its id ("1. Identity System"). Comments are not texts the app shows.
*/
/** Every source the app is built from, as text (its tests, generated tables and snapshots aside). */
const SOURCES = Object.entries(import.meta.glob("../**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>)
    .filter(([path]) => !/\.(test|generated)\.tsx?$/.test(path) && !path.startsWith("../test/") && !path.includes("/__snapshots__/"));

/** A line the app may show: not a comment, and not inside a block comment. */
function shownLines(text: string): { line: number; text: string }[] {
    const lines = text.split(/\r?\n/);
    const shown: { line: number; text: string }[] = [];
    let inComment = false;
    lines.forEach((line, at) => {
        const trimmed = line.trim();
        if (inComment) {
            if (trimmed.includes("*/")) inComment = false;
            return;
        }
        if (/^(\/\*|\{\/\*)/.test(trimmed)) {
            inComment = !trimmed.includes("*/");
            return;
        }
        if (/^(\/\/|\*)/.test(trimmed)) return;
        shown.push({ line: at + 1, text: line });
    });
    return shown;
}

/** A page or chapter named by a written number: after an arrow, or after "under", "on" or "in" -- "→ 3. Legal Entity", "under 2. Activities". */
const FIXED = /(?:→|\b(?:under|on|in))\s+\d+\.\s+(?!Identity System|Brand System|Business System|Strategy System)[A-Z][A-Za-z&;' ]*/;

describe("the app's texts", () => {
    it("name a page or a chapter by its name, never by a fixed number", () => {
        expect(SOURCES.length).toBeGreaterThan(100);
        const found = SOURCES.flatMap(([file, text]) => shownLines(text)
            .filter(entry => FIXED.test(entry.text))
            .map(entry => file.replace(/^\.\.\//, "") + ":" + entry.line + "  " + entry.text.trim().slice(0, 120)));
        expect(found).toEqual([]);
    });
});
