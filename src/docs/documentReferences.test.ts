import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { definedProperties, extractReferences, missingReferences, type Code } from "../../tools/scripts/docs/refs.ts";

/* The five documents that hold rules must not name a custom property, a class
   or a file that the code does not have. A document may name a few such things
   today (KNOWN_STALE): they are recorded, not hidden, and the test fails when
   a new one appears and also when a recorded one is gone (remove it from the
   list). When this fails: the document is stale (fix it), or the thing was
   renamed (fix the document), or, for a name the document uses on purpose, add
   it to ALLOWED with the reason. */

const DOCUMENTS = [
    "docs/ai/layout-rules.md",
    "docs/ai/customer-engagement-layout.md",
    "docs/ai/tile-and-card-pattern.md",
    "docs/specifications/business-system/page-3-infrastructure-and-capability.md",
    "docs/design/01-current-design.md",
    "docs/design/37-card-structure.md",
    "docs/ai/card-kinds.md"
];

/** Names a document may use without the code having them, each with its reason. */
const ALLOWED = new Map<string, string>([
    ["--quick", "a command-line flag of the layout check (npm run check:layout)"]
]);

/**
 * What each document names today that the code does not have: stale text still
 * to be fixed. None today: the rulebook was cleaned on 2026-10-17.
 */
const NONE = { properties: [], classes: [], files: [] };
const KNOWN_STALE: Record<string, { properties: string[]; classes: string[]; files: string[] }> = {};

/* The code: every stylesheet, component and script (names from the glob, text read from disk: a raw import is empty in the test runner). */
const codePaths = Object.keys(import.meta.glob("../**/*.{css,ts,tsx,json}"));
const otherPaths = [
    ...Object.keys(import.meta.glob("../../tools/scripts/**/*.{mjs,ts,js,json}")),
    ...Object.keys(import.meta.glob("../../docs/**/*.md"))
];
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const sources = codePaths.filter(path => !path.endsWith(".test.ts") && !path.endsWith(".test.tsx")).map(read);
const code: Code = {
    properties: new Set(sources.flatMap(definedProperties)),
    text: sources.join("\n"),
    files: new Set([...codePaths, ...otherPaths].map(path => path.split("/").pop() as string))
};

describe("the documents' references", () => {

    it("read the code (the check is not run on nothing)", () => {
        expect(codePaths.length).toBeGreaterThan(200);
        expect(code.properties.size).toBeGreaterThan(300);
        expect(code.properties.has("--info-gap")).toBe(true);
    });

    it("find a name the code lacks", () => {
        const references = extractReferences("The `--no-such-token` and `.no-such-class` in `NoSuchFile.tsx`, and `--info-gap` in `FoldArrow.tsx`.");
        const missing = missingReferences(references, code);
        expect(missing).toEqual({ properties: ["--no-such-token"], classes: ["no-such-class"], files: ["NoSuchFile.tsx"] });
    });

    it("take a family of properties (--theme-) as found when one starts with it", () => {
        const missing = missingReferences(extractReferences("`--theme-` and `--zzz-`"), code);
        expect(missing.properties).toEqual(["--zzz-"]);
    });

    for (const document of DOCUMENTS) {
        it(document + " names only custom properties, classes and files the code has", () => {
            const text = readFileSync(new URL("../../" + document, import.meta.url), "utf8");
            const missing = missingReferences(extractReferences(text), code, new Set(ALLOWED.keys()));
            expect(missing).toEqual(KNOWN_STALE[document] ?? NONE);
        });
    }

});
