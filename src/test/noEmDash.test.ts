// @vitest-environment node

import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * NO EM DASH IN THE APP'S OWN SENTENCES (user rule, 2026-09-29).
 *
 * Introductions, help and instruction bullets, "i" notes, labels,
 * placeholders and messages use a colon, a comma, a full stop or
 * parentheses instead of " — ". The one place it stays is a TITLE
 * SEPARATOR: a System and its page ("3. Business System — 4.
 * Financial Foundation") in the page header and in the Continue
 * line, listed below with the construction that builds it. The
 * opening screen's dialogue dash is U+2015, not an em dash. The
 * user's own answers and the examples' answer text are data and are
 * not scanned.
 *
 * Scanned: every .ts/.tsx source file under src/ (comments removed,
 * tests excluded: they repeat the app's strings) and the content
 * Markdown under src/assets.
 */
const TITLE_SEPARATORS: { file: string; construction: string; reason: string }[] = [
    {
        file: "components/interview/editors/InterviewHeader.tsx",
        construction: "{` — ${pageTitle}`}",
        reason: "the page header: System — page"
    },
    {
        file: "services/ProgressService.ts",
        construction: "where.title + \" — \" + pageRailItems",
        reason: "the Continue line: System — page"
    }
];

const SRC = new URL("../", import.meta.url);

/** Source text with its comments taken out (URLs' "//" kept). */
function withoutComments(text: string): string {
    return text
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

function offenders(): string[] {

    const found: string[] = [];

    for (const entry of readdirSync(SRC, { recursive: true })) {

        const path = entry.replace(/\\/g, "/");
        const code = /\.(ts|tsx)$/.test(path) && !/\.test\.(ts|tsx)$/.test(path);
        const content = path.startsWith("assets/") && path.endsWith(".md");

        if (!code && !content) {
            continue;
        }

        let text = readFileSync(new URL(path, SRC), "utf8");

        if (code) {
            text = withoutComments(text);
            for (const allowed of TITLE_SEPARATORS.filter(item => item.file === path)) {
                text = text.split(allowed.construction).join("");
            }
        }

        text.split(/\r?\n/).forEach((line, index) => {
            if (line.includes(" — ")) {
                found.push(path + ":" + (index + 1) + ": " + line.trim().slice(0, 120));
            }
        });

    }

    return found;

}

describe("no em dash in the app's own text", () => {

    it("keeps the title separators it allows where they are", () => {
        for (const allowed of TITLE_SEPARATORS) {
            expect(readFileSync(new URL(allowed.file, SRC), "utf8"), allowed.reason).toContain(allowed.construction);
        }
    });

    it("finds no sentence em dash in the source or the content", () => {
        expect(offenders()).toEqual([]);
    });

});
